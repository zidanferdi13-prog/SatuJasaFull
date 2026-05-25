import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import prisma from '../../config/prisma';
import { env } from '../../config/env';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const maxFileSize = 5 * 1024 * 1024;

const ensureDocumentFile = (file?: Express.Multer.File) => {
  if (!file) throw Object.assign(new Error('Document file is required'), { statusCode: 400 });
  if (!allowedMimeTypes.has(file.mimetype)) {
    throw Object.assign(new Error('Only JPEG, PNG, and PDF documents are allowed'), { statusCode: 415 });
  }
  if (file.size > maxFileSize) {
    throw Object.assign(new Error('Document file must be 5MB or smaller'), { statusCode: 413 });
  }
  return file;
};

export class TransactionDocumentService {
  static async list(transactionId: string, tenantId: string) {
    const transaction = await prisma.transaction.findFirst({ where: { id: transactionId, tenantId } });
    if (!transaction) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });

    return prisma.transactionDocument.findMany({
      where: {
        tenantId,
        deletedAt: null,
        transactionItem: { transactionId },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async upload(
    transactionId: string,
    itemId: string,
    tenantId: string,
    userId: string,
    documentCode: string,
    fileInput?: Express.Multer.File
  ) {
    const file = ensureDocumentFile(fileInput);
    if (!documentCode) throw Object.assign(new Error('documentCode is required'), { statusCode: 400 });

    const item = await prisma.transactionItem.findFirst({
      where: {
        id: itemId,
        transaction: { id: transactionId, tenantId },
      },
    });
    if (!item) throw Object.assign(new Error('Transaction item not found'), { statusCode: 404 });

    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const relativeDirectory = path.join(tenantId, transactionId, itemId);
    const absoluteDirectory = path.resolve(env.DOCUMENT_STORAGE_PATH, relativeDirectory);
    await fs.mkdir(absoluteDirectory, { recursive: true });

    const absolutePath = path.join(absoluteDirectory, fileName);
    await fs.writeFile(absolutePath, file.buffer);

    const fileUrl = `/storage/documents/${relativeDirectory.replace(/\\/g, '/')}/${fileName}`;

    return prisma.transactionDocument.create({
      data: {
        tenantId,
        transactionItemId: itemId,
        documentCode,
        fileName: file.originalname,
        fileUrl,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedBy: userId,
      },
    });
  }

  static async remove(transactionId: string, documentId: string, tenantId: string) {
    const document = await prisma.transactionDocument.findFirst({
      where: {
        id: documentId,
        tenantId,
        deletedAt: null,
        transactionItem: { transactionId },
      },
    });
    if (!document) throw Object.assign(new Error('Transaction document not found'), { statusCode: 404 });

    return prisma.transactionDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });
  }
}
