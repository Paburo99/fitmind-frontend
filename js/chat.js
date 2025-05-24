// Context-Aware Chat System for FitMind
import { makeApiRequest } from './apiService.js';
import { displayMessage } from './utils.js';

class ContextAwareChat {
    constructor() {
        this.isOpen = false;
        this.currentContext = this.detectPageContext();
        this.conversationHistory = [];
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.createChatWidget();
        this.attachEventListeners();
        this.loadContextSuggestions();
    }

    detectPageContext() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'dashboard';
        
        const contexts = {
            'dashboard': {
                name: 'Dashboard',
                emoji: '📊',
                focus: 'overview and daily summary',
                constraints: [
                    'Focus on daily fitness metrics and summaries',
                    'Help interpret dashboard data and trends',
                    'Provide motivational insights based on current progress',
                    'Suggest actions based on today\'s activity levels'
                ],
                suggestions: [
                    'How am I doing today?',
                    'What should I focus on next?',
                    'Explain my fitness summary',
                    'How can I improve my daily routine?'
                ]
            },
            'profile': {
                name: 'Profile',
                emoji: '👤',
                focus: 'personal settings and goals',
                constraints: [
                    'Help with profile setup and goal setting',
                    'Explain fitness levels and goal recommendations',
                    'Assist with dietary preferences and restrictions',
                    'Guide through personal information updates'
                ],
                suggestions: [
                    'Help me set realistic fitness goals',
                    'What fitness level should I choose?',
                    'How do I update my dietary preferences?',
                    'What information is important for my profile?'
                ]
            },
            'track_data': {
                name: 'Track Data',
                emoji: '📝',
                focus: 'logging workouts, nutrition, and activities',
                constraints: [
                    'Guide through data logging processes',
                    'Help with workout and nutrition entry',
                    'Explain tracking categories and metrics',
                    'Assist with accurate data recording'
                ],
                suggestions: [
                    'How do I log a workout?',
                    'What nutrition information should I track?',
                    'Help me record my water intake',
                    'How to track different exercise types?'
                ]
            },
            'recommendations': {
                name: 'Recommendations',
                emoji: '💡',
                focus: 'AI-powered workout and meal suggestions',
                constraints: [
                    'Explain AI recommendations and their basis',
                    'Help customize recommendation preferences',
                    'Clarify workout and meal suggestions',
                    'Guide on implementing recommendations'
                ],
                suggestions: [
                    'Why was this workout recommended?',
                    'How are meal suggestions personalized?',
                    'Can I customize my recommendations?',
                    'How often should I follow recommendations?'
                ]
            },
            'progress': {
                name: 'Progress',
                emoji: '📈',
                focus: 'charts, trends, and fitness analytics',
                constraints: [
                    'Help interpret charts and progress data',
                    'Explain trends and patterns in fitness metrics',
                    'Provide insights on progress over time',
                    'Guide on using analytics for improvement'
                ],
                suggestions: [
                    'What do these charts tell me?',
                    'How is my progress trending?',
                    'What patterns should I look for?',
                    'How can I improve based on my data?'
                ]
            }
        };

        return contexts[page] || contexts['dashboard'];
    }

    createChatWidget() {
        const chatWidget = document.createElement('div');
        chatWidget.className = 'chat-widget';
        chatWidget.innerHTML = `
            <button class="chat-toggle" id="chatToggle" title="Chat with FitMind AI">
                💬
            </button>
            <div class="chat-container" id="chatContainer">
                <div class="chat-header">
                    <div class="chat-title">
                        ${this.currentContext.emoji} FitMind AI
                        <span class="page-context">${this.currentContext.name}</span>
                    </div>
                    <button class="chat-close" id="chatClose">×</button>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="context-suggestions" id="contextSuggestions"></div>
                    <div class="chat-message">
                        <div class="message-avatar bot">🤖</div>
                        <div class="message-content">
                            Hi! I'm your FitMind AI assistant. I'm here to help you with <strong>${this.currentContext.focus}</strong>. 
                            <br><br>Ask me anything about your fitness journey, and I'll provide personalized guidance based on your current page context!
                        </div>
                    </div>
                </div>
                <div class="chat-input-area">
                    <div class="chat-input-container">
                        <textarea 
                            class="chat-input" 
                            id="chatInput" 
                            placeholder="Ask me anything about ${this.currentContext.name.toLowerCase()}..."
                            rows="1"
                        ></textarea>
                        <button class="chat-send" id="chatSend" disabled>
                            📤
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(chatWidget);
    }

    attachEventListeners() {
        const chatToggle = document.getElementById('chatToggle');
        const chatClose = document.getElementById('chatClose');
        const chatContainer = document.getElementById('chatContainer');
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');

        chatToggle.addEventListener('click', () => this.toggleChat());
        chatClose.addEventListener('click', () => this.closeChat());
        
        chatInput.addEventListener('input', () => this.handleInputChange());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        chatSend.addEventListener('click', () => this.sendMessage());

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !chatContainer.contains(e.target) && !chatToggle.contains(e.target)) {
                this.closeChat();
            }
        });

        // Auto-resize textarea
        chatInput.addEventListener('input', () => {
            chatInput.style.height = '20px';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
        });
    }

    loadContextSuggestions() {
        const suggestionsContainer = document.getElementById('contextSuggestions');
        
        this.currentContext.suggestions.forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.addEventListener('click', () => {
                document.getElementById('chatInput').value = suggestion;
                this.handleInputChange();
                this.sendMessage();
            });
            suggestionsContainer.appendChild(chip);
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatContainer = document.getElementById('chatContainer');
        const chatToggle = document.getElementById('chatToggle');
        
        chatContainer.classList.add('show');
        chatToggle.innerHTML = '✕';
        this.isOpen = true;
        
        // Focus on input after animation
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);
    }

    closeChat() {
        const chatContainer = document.getElementById('chatContainer');
        const chatToggle = document.getElementById('chatToggle');
        
        chatContainer.classList.remove('show');
        chatToggle.innerHTML = '💬';
        this.isOpen = false;
    }

    handleInputChange() {
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');
        
        const hasText = chatInput.value.trim().length > 0;
        chatSend.disabled = !hasText || this.isTyping;
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        chatInput.value = '';
        this.handleInputChange();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Prepare context-aware prompt
            const contextualPrompt = this.buildContextualPrompt(message);
            
            // Send to AI service
            const response = await makeApiRequest('/chat/context-aware', 'POST', {
                message: contextualPrompt,
                conversation_history: this.conversationHistory.slice(-10), // Last 10 messages for context
                page_context: this.currentContext.name.toLowerCase(),
                user_constraints: this.currentContext.constraints
            });
            
            this.hideTypingIndicator();
            
            if (response && response.reply) {
                this.addMessage(response.reply, 'bot');
                this.conversationHistory.push({
                    user: message,
                    bot: response.reply,
                    timestamp: new Date().toISOString(),
                    context: this.currentContext.name
                });
            } else {
                this.addMessage('I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.', 'bot');
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Chat error:', error);
            this.addMessage('I\'m experiencing some technical difficulties. Please try again later or contact support if the issue persists.', 'bot');
        }
    }

    buildContextualPrompt(userMessage) {
        const systemContext = `
You are FitMind AI, a specialized fitness and wellness assistant. You are currently helping a user on the ${this.currentContext.name} page.

CURRENT PAGE CONTEXT: ${this.currentContext.focus}

CONSTRAINTS AND GUIDELINES:
${this.currentContext.constraints.map(constraint => `- ${constraint}`).join('\n')}

IMPORTANT RULES:
- Keep responses concise and actionable (2-3 sentences max unless complex explanation needed)
- Stay focused on ${this.currentContext.name.toLowerCase()}-related topics
- Use fitness and health terminology appropriately
- Provide specific, practical advice when possible
- If asked about topics outside your scope, politely redirect to relevant fitness/health aspects
- Use emojis sparingly and appropriately
- Be encouraging and motivational
- Reference user data context when relevant (mention if they should check their dashboard, etc.)

USER'S QUESTION: ${userMessage}

Provide a helpful, context-aware response:`;

        return systemContext;
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${sender}`;
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = this.formatMessage(text);
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        content.appendChild(time);
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(text) {
        // Basic formatting for bot messages
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatMessages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar bot">🤖</div>
            <div>
                FitMind AI is thinking
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.handleInputChange();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.handleInputChange();
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
        new ContextAwareChat();
    }
});

export default ContextAwareChat;
