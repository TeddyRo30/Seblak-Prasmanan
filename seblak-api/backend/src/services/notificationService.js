// src/services/notificationService.js
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

/**
 * Initialize email transporter
 * Gunakan environment variables untuk konfigurasi
 */
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Email templates
 */
const emailTemplates = {
  orderConfirmed: (orderNumber, customerName, total) => ({
    subject: `Pesanan #${orderNumber} Dikonfirmasi`,
    html: `
      <h2>Pesanan Dikonfirmasi!</h2>
      <p>Halo ${customerName},</p>
      <p>Pesanan Anda dengan nomor <strong>#${orderNumber}</strong> telah dikonfirmasi.</p>
      <p><strong>Total: Rp ${total.toLocaleString('id-ID')}</strong></p>
      <p>Kami akan segera menyiapkan pesanan Anda.</p>
      <p>Terima kasih telah memesan di Seblak Prasmanan!</p>
    `
  }),

  orderReady: (orderNumber, customerName) => ({
    subject: `Pesanan #${orderNumber} Siap!`,
    html: `
      <h2>Pesanan Siap Diambil!</h2>
      <p>Halo ${customerName},</p>
      <p>Pesanan Anda dengan nomor <strong>#${orderNumber}</strong> sudah siap!</p>
      <p>Silakan datang untuk mengambil pesanan Anda atau tunggu driver kami.</p>
    `
  }),

  orderDelivering: (orderNumber, customerName, driverName, driverPhone) => ({
    subject: `Pesanan #${orderNumber} Dalam Pengiriman`,
    html: `
      <h2>Pesanan Dalam Pengiriman!</h2>
      <p>Halo ${customerName},</p>
      <p>Pesanan Anda dengan nomor <strong>#${orderNumber}</strong> sedang dalam pengiriman.</p>
      <p><strong>Driver: ${driverName}</strong></p>
      <p><strong>No. HP: ${driverPhone}</strong></p>
      <p>Pesanan akan sampai segera. Terima kasih!</p>
    `
  }),

  orderCompleted: (orderNumber, customerName) => ({
    subject: `Pesanan #${orderNumber} Selesai`,
    html: `
      <h2>Pesanan Selesai!</h2>
      <p>Halo ${customerName},</p>
      <p>Pesanan Anda dengan nomor <strong>#${orderNumber}</strong> telah selesai.</p>
      <p>Kami harap Anda puas dengan pesanan kami!</p>
      <p>Berikan rating untuk membantu kami meningkatkan layanan.</p>
    `
  }),

  paymentConfirmed: (orderNumber, customerName, amount) => ({
    subject: `Pembayaran #${orderNumber} Terkonfirmasi`,
    html: `
      <h2>Pembayaran Terkonfirmasi!</h2>
      <p>Halo ${customerName},</p>
      <p>Pembayaran untuk pesanan <strong>#${orderNumber}</strong> sebesar <strong>Rp ${amount.toLocaleString('id-ID')}</strong> telah terkonfirmasi.</p>
      <p>Pesanan Anda siap diproses. Terima kasih!</p>
    `
  }),

  registrationSuccess: (customerName) => ({
    subject: 'Selamat Datang di Seblak Prasmanan!',
    html: `
      <h2>Pendaftaran Berhasil!</h2>
      <p>Selamat datang ${customerName}!</p>
      <p>Akun Anda telah berhasil dibuat.</p>
      <p>Silakan login dan mulai pesan seblak favorit Anda!</p>
    `
  })
};

/**
 * Send email
 */
const sendEmail = async (recipientEmail, subject, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️ Email not configured. Skipping email notification.');
      return { sent: false, reason: 'Email not configured' };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@seblakprasmanan.com',
      to: recipientEmail,
      subject,
      html
    };

    const info = await emailTransporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { sent: false, error: error.message };
  }
};

/**
 * Create in-app notification
 */
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        isRead: false
      }
    });

    return notification;
  } catch (error) {
    throw error;
  }
};

/**
 * Notify order confirmed
 */
const notifyOrderConfirmed = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!order) throw { status: 404, message: 'Order not found' };

    const { orderNumber, total, customer } = order;

    // Email
    const emailTemplate = emailTemplates.orderConfirmed(orderNumber, customer.fullName, total);
    await sendEmail(customer.email, emailTemplate.subject, emailTemplate.html);

    // In-app notification
    await createNotification(
      customer.id,
      'ORDER_CONFIRMED',
      'Pesanan Dikonfirmasi',
      `Pesanan #${orderNumber} telah dikonfirmasi!`,
      { orderId, orderNumber }
    );

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

/**
 * Notify order ready
 */
const notifyOrderReady = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!order) throw { status: 404, message: 'Order not found' };

    const { orderNumber, customer } = order;

    // Email
    const emailTemplate = emailTemplates.orderReady(orderNumber, customer.fullName);
    await sendEmail(customer.email, emailTemplate.subject, emailTemplate.html);

    // In-app notification
    await createNotification(
      customer.id,
      'ORDER_READY',
      'Pesanan Siap',
      `Pesanan #${orderNumber} sudah siap!`,
      { orderId, orderNumber }
    );

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

/**
 * Notify order on delivery
 */
const notifyOrderOnDelivery = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true }
        },
        driver: {
          select: { fullName: true, phone: true }
        }
      }
    });

    if (!order) throw { status: 404, message: 'Order not found' };

    const { orderNumber, customer, driver } = order;

    // Email
    const emailTemplate = emailTemplates.orderDelivering(
      orderNumber,
      customer.fullName,
      driver?.fullName || 'Driver',
      driver?.phone || 'N/A'
    );
    await sendEmail(customer.email, emailTemplate.subject, emailTemplate.html);

    // In-app notification
    await createNotification(
      customer.id,
      'ORDER_DELIVERING',
      'Pesanan Dalam Pengiriman',
      `Pesanan #${orderNumber} sedang dalam pengiriman`,
      { orderId, orderNumber, driver: driver?.fullName }
    );

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

/**
 * Notify order completed
 */
const notifyOrderCompleted = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!order) throw { status: 404, message: 'Order not found' };

    const { orderNumber, customer } = order;

    // Email
    const emailTemplate = emailTemplates.orderCompleted(orderNumber, customer.fullName);
    await sendEmail(customer.email, emailTemplate.subject, emailTemplate.html);

    // In-app notification
    await createNotification(
      customer.id,
      'ORDER_COMPLETED',
      'Pesanan Selesai',
      `Pesanan #${orderNumber} telah selesai`,
      { orderId, orderNumber }
    );

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

/**
 * Notify payment confirmed
 */
const notifyPaymentConfirmed = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true }
        },
        payment: {
          select: { amount: true }
        }
      }
    });

    if (!order) throw { status: 404, message: 'Order not found' };

    const { orderNumber, customer, payment } = order;

    // Email
    const emailTemplate = emailTemplates.paymentConfirmed(
      orderNumber,
      customer.fullName,
      payment?.amount || 0
    );
    await sendEmail(customer.email, emailTemplate.subject, emailTemplate.html);

    // In-app notification
    await createNotification(
      customer.id,
      'PAYMENT_CONFIRMED',
      'Pembayaran Terkonfirmasi',
      `Pembayaran untuk pesanan #${orderNumber} telah terkonfirmasi`,
      { orderId, orderNumber }
    );

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit = 20, offset = 0, isRead } = options;

    const where = {
      userId,
      ...(isRead !== undefined && { isRead })
    };

    const notifications = await prisma.notification.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.notification.count({ where });

    return {
      data: notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return { updated: result.count };
  } catch (error) {
    throw error;
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return count;
  } catch (error) {
    throw error;
  }
};

export default {
  sendEmail,
  createNotification,
  notifyOrderConfirmed,
  notifyOrderReady,
  notifyOrderOnDelivery,
  notifyOrderCompleted,
  notifyPaymentConfirmed,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
};