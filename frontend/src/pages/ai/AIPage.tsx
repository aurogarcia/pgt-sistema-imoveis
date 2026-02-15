import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Send,
  Person,
  SmartToy,
  Agriculture,
  LocationCity,
  Gavel,
  Assignment
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const suggestedQuestions = [
  "Como regularizar minha propriedade rural?",
  "O que é REURB e como funciona?",
  "Quais documentos preciso para o CAR?",
  "Como calcular o IRTR?",
  "Minha propriedade precisa de licença ambiental?",
  "Diferenças entre REURB-S e REURB-E"
];

export function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Mensagem de boas-vindas
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Olá, ${user?.fullName}! 👋\n\nSou seu assistente especializado em regularização fundiária rural e urbana. Posso ajudá-lo com:\n\n🌾 **Imóveis Rurais:** CAR, SIGEF, INCRA, licenças ambientais\n🏢 **Imóveis Urbanos:** REURB, regularização urbana, documentação\n📋 **IRTR:** Cálculos, prazos, isenções\n⚖️ **Legislação:** Leis aplicáveis, procedimentos legais\n\nComo posso ajudá-lo hoje?`,
      timestamp: new Date().toISOString()
    }]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/chat', {
        message,
        contextType: 'general'
      });

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar mensagem');
      console.error('Erro no chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        Assistente IA - Especialista Fundiário 🤖
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Chat com inteligência artificial especializada em regularização de imóveis rurais e urbanos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Área de conversação */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', mb: 2 }}>
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2,
          maxHeight: '500px'
        }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{ mb: 2 }}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  {message.role === 'user' ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
                </Avatar>
                
                <Card sx={{ 
                  flex: 1, 
                  bgcolor: message.role === 'user' ? 'grey.100' : 'background.paper'
                }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.9rem',
                        lineHeight: 1.5
                      }}
                    >
                      {message.content}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ))}
          
          {loading && (
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                <SmartToy fontSize="small" />
              </Avatar>
              <Card sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Processando sua pergunta...
                  </Typography>
                </Box>
              </Card>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />
        
        {/* Campo de entrada */}
        <Box sx={{ p: 2 }}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Digite sua pergunta sobre regularização de imóveis..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              sx={{ minWidth: '100px' }}
            >
              Enviar
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Perguntas sugeridas */}
      {messages.length <= 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment color="primary" />
              Perguntas Frequentes
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestedQuestions.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  variant="outlined"
                  clickable
                  onClick={() => handleSuggestedQuestion(question)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Áreas de especialização */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Áreas de Especialização
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip 
              icon={<Agriculture />} 
              label="Imóveis Rurais" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              icon={<LocationCity />} 
              label="REURB Urbana" 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              icon={<Gavel />} 
              label="Legislação" 
              color="info" 
              variant="outlined" 
            />
            <Chip 
              icon={<Assignment />} 
              label="IRTR" 
              color="success" 
              variant="outlined" 
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}