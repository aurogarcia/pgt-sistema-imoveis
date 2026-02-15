import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Mock database para arquivos
interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  propertyId?: string;
  propertyType?: 'rural' | 'urban';
  category: 'document' | 'image' | 'other';
  uploadedAt: string;
  uploadedBy: string;
}

let mockFiles: UploadedFile[] = [
  {
    id: '1',
    originalName: 'escritura_fazenda_bela_vista.pdf',
    filename: 'escritura_fazenda_bela_vista_1640995200000.pdf',
    mimetype: 'application/pdf',
    size: 2048576,
    path: '/uploads/documents/',
    propertyId: '1',
    propertyType: 'rural',
    category: 'document',
    uploadedAt: new Date().toISOString(),
    uploadedBy: '1'
  },
  {
    id: '2',
    originalName: 'planta_apartamento_centro.png',
    filename: 'planta_apartamento_centro_1640995260000.png',
    mimetype: 'image/png',
    size: 1024000,
    path: '/uploads/images/',
    propertyId: '1',
    propertyType: 'urban',
    category: 'image',
    uploadedAt: new Date().toISOString(),
    uploadedBy: '1'
  }
];

// Simular multer middleware
const simulateFileUpload = (file: any): Omit<UploadedFile, 'propertyId' | 'propertyType'> => {
  const timestamp = Date.now();
  const ext = path.extname(file.name);
  const filename = `${path.basename(file.name, ext)}_${timestamp}${ext}`;
  
  let category: 'document' | 'image' | 'other' = 'other';
  if (file.mimetype.startsWith('image/')) category = 'image';
  else if (file.mimetype === 'application/pdf' || file.mimetype.includes('document')) category = 'document';

  return {
    id: (mockFiles.length + 1).toString(),
    originalName: file.name,
    filename,
    mimetype: file.mimetype,
    size: file.size,
    path: `/uploads/${category}s/`,
    category,
    uploadedAt: new Date().toISOString(),
    uploadedBy: '1' // Mock user ID
  };
};

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const { propertyId, propertyType } = req.body;
    
    // Simular arquivos recebidos (em produção, usar multer)
    const mockUploadedFiles = [
      {
        name: 'documento_exemplo.pdf',
        mimetype: 'application/pdf',
        size: 1024000
      }
    ];

    const uploadedFiles: UploadedFile[] = [];

    for (const file of mockUploadedFiles) {
      const fileData: UploadedFile = {
        ...simulateFileUpload(file),
        propertyId: propertyId || undefined,
        propertyType: propertyType as 'rural' | 'urban' || undefined
      };

      mockFiles.push(fileData);
      uploadedFiles.push(fileData);
    }

    res.json({
      message: 'Arquivos enviados com sucesso',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { propertyId, propertyType, category } = req.query;
    
    let filteredFiles = [...mockFiles];

    if (propertyId) {
      filteredFiles = filteredFiles.filter(f => f.propertyId === propertyId);
    }

    if (propertyType) {
      filteredFiles = filteredFiles.filter(f => f.propertyType === propertyType);
    }

    if (category) {
      filteredFiles = filteredFiles.filter(f => f.category === category);
    }

    // Ordenar por data de upload (mais recentes primeiro)
    filteredFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    res.json({
      files: filteredFiles,
      total: filteredFiles.length
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getFileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const file = mockFiles.find(f => f.id === id);
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.json({ file });
  } catch (error) {
    console.error('Erro ao buscar arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const file = mockFiles.find(f => f.id === id);
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    // Em produção, seria algo como:
    // const filePath = path.join(uploadDir, file.filename);
    // res.download(filePath, file.originalName);

    // Para mock, retornar informações do arquivo
    res.json({
      message: 'Download simulado',
      file: {
        id: file.id,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const fileIndex = mockFiles.findIndex(f => f.id === id);
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const file = mockFiles[fileIndex];
    
    // Remover do mock database
    mockFiles.splice(fileIndex, 1);

    res.json({
      message: 'Arquivo removido com sucesso',
      file: {
        id: file.id,
        originalName: file.originalName
      }
    });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getFileStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      totalFiles: mockFiles.length,
      totalSize: mockFiles.reduce((sum, file) => sum + file.size, 0),
      byCategory: {
        documents: mockFiles.filter(f => f.category === 'document').length,
        images: mockFiles.filter(f => f.category === 'image').length,
        others: mockFiles.filter(f => f.category === 'other').length
      },
      byPropertyType: {
        rural: mockFiles.filter(f => f.propertyType === 'rural').length,
        urban: mockFiles.filter(f => f.propertyType === 'urban').length,
        unassigned: mockFiles.filter(f => !f.propertyId).length
      },
      recentUploads: mockFiles
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 5)
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}