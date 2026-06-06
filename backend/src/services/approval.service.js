const { ApprovalWorkflow, ApprovalStep, Quotation, User, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const notificationService = require('./notification.service');
const { logActivity } = require('../utils/logger');

class ApprovalService {
  async initiateApproval(data, initiatorId) {
    const t = await sequelize.transaction();
    try {
      const { rfqId, quotationId, approvers } = data;
      
      const workflow = await ApprovalWorkflow.create({
        rfqId,
        quotationId,
        initiatorId
      }, { transaction: t });

      if (approvers && approvers.length > 0) {
        const stepData = approvers.map(a => ({
          workflowId: workflow.id,
          approverId: a.approverId,
          stepOrder: a.stepOrder
        }));
        await ApprovalStep.bulkCreate(stepData, { transaction: t });
      }

      await t.commit();
      
      // Notify first approver
      if (approvers && approvers.length > 0) {
        const firstApprover = approvers.find(a => a.stepOrder === 1);
        if (firstApprover) {
           await notificationService.createNotification(firstApprover.approverId, 'Approval Required', 'A new quotation requires your approval.', 'APPROVAL_REQUEST', '/approvals/' + workflow.id);
        }
      }
      
      await logActivity(initiatorId, 'INITIATE_APPROVAL', 'ApprovalWorkflow', workflow.id, 'Initiated approval workflow for quotation');
      
      return await ApprovalWorkflow.findByPk(workflow.id, {
        include: [{ model: ApprovalStep, as: 'steps' }]
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async processApproval(stepId, approverId, status, remarks) {
    const t = await sequelize.transaction();
    try {
      const step = await ApprovalStep.findOne({ 
        where: { id: stepId, approverId },
        include: [{ model: ApprovalWorkflow, as: 'workflow' }]
      });

      if (!step) throw new AppError('Approval step not found or you are not authorized', 404);
      if (step.status !== 'PENDING') throw new AppError('Step already processed', 400);

      step.status = status;
      step.remarks = remarks;
      await step.save({ transaction: t });

      const workflow = step.workflow;

      if (status === 'REJECTED') {
        workflow.status = 'REJECTED';
        await workflow.save({ transaction: t });
        
        const quotation = await Quotation.findByPk(workflow.quotationId);
        quotation.status = 'REJECTED';
        await quotation.save({ transaction: t });

        await notificationService.createNotification(workflow.initiatorId, 'Quotation Rejected', 'Your quotation approval request was rejected.', 'APPROVAL_REJECTED', `/quotations/${quotation.id}`);
        await logActivity(approverId, 'REJECT_APPROVAL', 'ApprovalStep', step.id, 'Rejected quotation approval');
      } else if (status === 'APPROVED') {
        const nextStep = await ApprovalStep.findOne({
          where: { workflowId: workflow.id, stepOrder: step.stepOrder + 1 }
        });

        if (nextStep) {
          // Send notification to next approver
          await notificationService.createNotification(nextStep.approverId, 'Approval Required', 'A quotation requires your approval.', 'APPROVAL_REQUEST', `/approvals/${workflow.id}`);
        } else {
          // Final approval
          workflow.status = 'APPROVED';
          await workflow.save({ transaction: t });
          
          const quotation = await Quotation.findByPk(workflow.quotationId);
          quotation.status = 'ACCEPTED';
          await quotation.save({ transaction: t });

          await notificationService.createNotification(workflow.initiatorId, 'Quotation Approved', 'Your quotation has been fully approved.', 'APPROVAL_APPROVED', `/quotations/${quotation.id}`);
        }
        await logActivity(approverId, 'APPROVE_APPROVAL', 'ApprovalStep', step.id, 'Approved quotation');
      }

      await t.commit();
      return step;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new ApprovalService();
