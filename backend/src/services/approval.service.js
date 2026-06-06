const { ApprovalWorkflow, ApprovalStep, Quotation, Rfq, Vendor, User, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const notificationService = require('./notification.service');
const emailService = require('./email.service');
const { logActivity } = require('../utils/logger');

class ApprovalService {
  async initiateApproval(data, initiatorId) {
    const t = await sequelize.transaction();
    try {
      const { rfqId, quotationId, approvers } = data;
      
      const rfq = await Rfq.findByPk(rfqId);
      const quotation = await Quotation.findByPk(quotationId, { include: [{ model: Vendor, as: 'vendor' }] });

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
           const approverUser = await User.findByPk(firstApprover.approverId);
           await notificationService.createNotification(firstApprover.approverId, 'Approval Required', 'A new quotation requires your approval.', 'APPROVAL_REQUEST', '/approvals/' + workflow.id);
           await emailService.sendApprovalRequest(approverUser, workflow, rfq, quotation.vendor, quotation, initiatorId, null);
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

      const workflow = step.workflow;
      const rfq = await Rfq.findByPk(workflow.rfqId);
      const quotation = await Quotation.findByPk(workflow.quotationId, { include: [{ model: Vendor, as: 'vendor' }] });
      const initiator = await User.findByPk(workflow.initiatorId);

      step.status = status;
      step.remarks = remarks;
      await step.save({ transaction: t });

      if (status === 'REJECTED') {
        workflow.status = 'REJECTED';
        await workflow.save({ transaction: t });
        
        quotation.status = 'REJECTED';
        await quotation.save({ transaction: t });

        await notificationService.createNotification(workflow.initiatorId, 'Quotation Rejected', 'Your quotation approval request was rejected.', 'APPROVAL_REJECTED', `/quotations/${quotation.id}`);
        await emailService.sendApprovalStatus(initiator, workflow, rfq, quotation.vendor, 'REJECTED', remarks, approverId, null);
        await logActivity(approverId, 'REJECT_APPROVAL', 'ApprovalStep', step.id, 'Rejected quotation approval');
      } else if (status === 'APPROVED') {
        const nextStep = await ApprovalStep.findOne({
          where: { workflowId: workflow.id, stepOrder: step.stepOrder + 1 }
        });

        if (nextStep) {
          // Send notification to next approver
          const nextApproverUser = await User.findByPk(nextStep.approverId);
          await notificationService.createNotification(nextStep.approverId, 'Approval Required', 'A quotation requires your approval.', 'APPROVAL_REQUEST', `/approvals/${workflow.id}`);
          await emailService.sendApprovalRequest(nextApproverUser, workflow, rfq, quotation.vendor, quotation, approverId, null);
        } else {
          // Final approval
          workflow.status = 'APPROVED';
          await workflow.save({ transaction: t });
          
          quotation.status = 'ACCEPTED';
          await quotation.save({ transaction: t });

          await notificationService.createNotification(workflow.initiatorId, 'Quotation Approved', 'Your quotation has been fully approved.', 'APPROVAL_APPROVED', `/quotations/${quotation.id}`);
          await emailService.sendApprovalStatus(initiator, workflow, rfq, quotation.vendor, 'APPROVED', remarks, approverId, null);
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
