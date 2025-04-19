import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, MessageSquare, BarChart, Send, Loader2 } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  model: 'chatgpt' | 'gemini';
}

export function StudentDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<'chatgpt' | 'gemini'>('chatgpt');
  const [classroomId, setClassroomId] = useState('');
  const [showClassroomForm, setShowClassroomForm] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    loadConversations();
    const testUser = localStorage.getItem('testUser');
    if (testUser) {
      setUserInfo(JSON.parse(testUser));
    }
  }, []);

  const loadConversations = async () => {
    try {
      // Check for test user first
      const testUser = localStorage.getItem('test_user');
      if (testUser) {
        // For test user, create a sample conversation
        const sampleConversation = {
          id: 'test-conversation',
          title: 'Sample Conversation',
          created_at: new Date().toISOString(),
          messages: [
            {
              id: 'test-message-1',
              content: 'Welcome to Thinkly! This is a sample conversation.',
              role: 'assistant' as const,
              created_at: new Date().toISOString(),
              model: 'chatgpt' as const
            }
          ]
        };
        setConversations([sampleConversation]);
        setSelectedConversation(sampleConversation);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (conversations) {
        setConversations(conversations);
        if (conversations.length > 0) {
          setSelectedConversation(conversations[0]);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (classroomId.trim()) {
      setShowClassroomForm(false);
      // Create a new conversation when classroom is submitted
      const newConversation = {
        id: `conversation-${Date.now()}`,
        title: `Classroom ${classroomId}`,
        created_at: new Date().toISOString(),
        messages: [
          {
            id: `welcome-${Date.now()}`,
            content: `Welcome to Classroom ${classroomId}! How can I help you today?`,
            role: 'assistant' as const,
            created_at: new Date().toISOString(),
            model: 'chatgpt' as const
          }
        ]
      };
      setConversations([newConversation]);
      setSelectedConversation(newConversation);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // If no conversation is selected, create a new one
    if (!selectedConversation) {
      const newConversation = {
        id: `conversation-${Date.now()}`,
        title: `New Conversation`,
        created_at: new Date().toISOString(),
        messages: []
      };
      setConversations(prev => [...prev, newConversation]);
      setSelectedConversation(newConversation);
    }

    setIsLoading(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      // Check for test user
      const testUser = localStorage.getItem('test_user');
      if (testUser) {
        // Check for different types of questions
        const questionType = determineQuestionType(messageContent);
        
        if (questionType === 'math') {
          // Handle math problems
          const problem = messageContent.match(/(\d+[\+\-\*\/]\d+)/)?.[0];
          if (problem) {
            let solution;
            let explanation;

            try {
              solution = Function('return ' + problem)();
              explanation = `Let's solve ${problem} step by step:\n\n`;
              
              if (problem.includes('+')) {
                const [a, b] = problem.split('+');
                explanation += `1. Addition: ${a} + ${b} = ${solution}\n`;
              } else if (problem.includes('-')) {
                const [a, b] = problem.split('-');
                explanation += `1. Subtraction: ${a} - ${b} = ${solution}\n`;
              } else if (problem.includes('*')) {
                const [a, b] = problem.split('*');
                explanation += `1. Multiplication: ${a} × ${b} = ${solution}\n`;
              } else if (problem.includes('/')) {
                const [a, b] = problem.split('/');
                explanation += `1. Division: ${a} ÷ ${b} = ${solution}\n`;
              }
              
              explanation += `\nFinal Answer: ${solution}`;
            } catch (error) {
              solution = "Error: Invalid math expression";
              explanation = "I couldn't solve this math problem. Please make sure it's a valid expression.";
            }

            const chatGPTResponse = {
              content: `[ChatGPT Solution]\n\n${explanation}\n\nWould you like me to explain any part of the solution in more detail?`,
              model: 'chatgpt' as const
            };

            const geminiResponse = {
              content: `[Gemini Verification]\n\nI've double-checked the solution:\n\n1. The calculation is correct: ${problem} = ${solution}\n\n2. Here's a different way to think about it:\n   - If we break it down: ${problem}\n   - We can verify by: ${solution}\n\n3. Tips for similar problems:\n   - Remember the order of operations (PEMDAS)\n   - Double-check your calculations\n   - Use a calculator for verification\n\nWould you like to try another problem?`,
              model: 'gemini' as const
            };
            
            // Update conversation with user message and AI responses
            const updatedMessages = [
              ...selectedConversation.messages,
              {
                id: `user-${Date.now()}`,
                content: messageContent,
                role: 'user' as const,
                created_at: new Date().toISOString(),
                model
              },
              {
                id: `chatgpt-${Date.now()}`,
                content: chatGPTResponse.content,
                role: 'assistant' as const,
                created_at: new Date().toISOString(),
                model: chatGPTResponse.model
              },
              {
                id: `gemini-${Date.now()}`,
                content: geminiResponse.content,
                role: 'assistant' as const,
                created_at: new Date().toISOString(),
                model: geminiResponse.model
              }
            ];

            const updatedConversation = {
              ...selectedConversation,
              messages: updatedMessages
            };

            setSelectedConversation(updatedConversation);
            setConversations(prev => 
              prev.map(conv => 
                conv.id === updatedConversation.id ? updatedConversation : conv
              )
            );
            setIsLoading(false);
            return;
          }
        }

        // Generate appropriate responses based on question type
        const responses = generateResponses(messageContent, questionType);
        
        // Update conversation with user message and AI responses
        const updatedMessages = [
          ...selectedConversation.messages,
          {
            id: `user-${Date.now()}`,
            content: messageContent,
            role: 'user' as const,
            created_at: new Date().toISOString(),
            model
          },
          {
            id: `chatgpt-${Date.now()}`,
            content: responses.chatGPT.content,
            role: 'assistant' as const,
            created_at: new Date().toISOString(),
            model: responses.chatGPT.model
          },
          {
            id: `gemini-${Date.now()}`,
            content: responses.gemini.content,
            role: 'assistant' as const,
            created_at: new Date().toISOString(),
            model: responses.gemini.model
          }
        ];

        const updatedConversation = {
          ...selectedConversation,
          messages: updatedMessages
        };

        setSelectedConversation(updatedConversation);
        setConversations(prev => 
          prev.map(conv => 
            conv.id === updatedConversation.id ? updatedConversation : conv
          )
        );
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Add user message to conversation
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          content: messageContent,
          role: 'user',
          model
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          model,
          conversationId: selectedConversation.id
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const aiResponse = await response.json();

      // Add AI response to conversation
      await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          content: aiResponse.content,
          role: 'assistant',
          model
        });

      // Reload conversations to update the UI
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const determineQuestionType = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (message.match(/(\d+[\+\-\*\/]\d+)/)) return 'math';
    if (lowerMessage.includes('help') || lowerMessage.includes('explain')) return 'concept';
    if (lowerMessage.includes('what is') || lowerMessage.includes('define')) return 'definition';
    if (lowerMessage.includes('how to') || lowerMessage.includes('steps')) return 'procedure';
    if (lowerMessage.includes('why') || lowerMessage.includes('reason')) return 'explanation';
    if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) return 'comparison';
    if (lowerMessage.includes('example') || lowerMessage.includes('instance')) return 'example';
    if (lowerMessage.includes('study') || lowerMessage.includes('learn')) return 'study';
    if (lowerMessage.includes('essay') || lowerMessage.includes('writing')) return 'writing';
    if (lowerMessage.includes('language') || lowerMessage.includes('speak')) return 'language';
    if (lowerMessage.includes('schedule') || lowerMessage.includes('plan')) return 'planning';
    if (lowerMessage.includes('special') || lowerMessage.includes('disability')) return 'special_ed';
    if (lowerMessage.includes('textbook') || lowerMessage.includes('resource')) return 'resources';
    if (lowerMessage.includes('parent') || lowerMessage.includes('track')) return 'tracking';
    if (lowerMessage.includes('teacher') || lowerMessage.includes('classroom')) return 'teaching';
    if (lowerMessage.includes('content') || lowerMessage.includes('lesson')) return 'content';
    
    return 'general';
  };

  const generateResponses = (message: string, type: string) => {
    const responses = {
      concept: {
        chatGPT: {
          content: `[ChatGPT Explanation]\n\nLet me help you understand this concept thoroughly.\n\n1. Core Concept:\n   - Definition and key principles\n   - Why it's important\n   - How it relates to your studies\n\n2. Step-by-Step Breakdown:\n   - First step: Detailed explanation\n   - Second step: Examples and applications\n   - Third step: Common challenges and solutions\n\n3. Practical Applications:\n   - Real-world examples\n   - How to apply this knowledge\n   - Tips for remembering and using this concept\n\nWould you like me to focus on any specific aspect?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Additional Insights]\n\nLet me provide some additional perspectives:\n\n1. Alternative Approaches:\n   - Different ways to understand the concept\n   - Visual representations and analogies\n   - Historical context and development\n\n2. Critical Thinking:\n   - Common misconceptions to avoid\n   - How to verify your understanding\n   - Questions to test your knowledge\n\n3. Learning Strategies:\n   - Best practices for mastering this topic\n   - Study techniques and resources\n   - How to apply this in exams\n\nWould you like to explore any of these aspects further?`,
          model: 'gemini' as const
        }
      },
      definition: {
        chatGPT: {
          content: `[ChatGPT Definition]\n\nLet me provide a comprehensive definition:\n\n1. Basic Definition:\n   - Clear explanation of the term\n   - Key characteristics\n   - Important distinctions\n\n2. Detailed Explanation:\n   - Components and elements\n   - How it works\n   - Why it matters\n\n3. Context and Usage:\n   - Where it's used\n   - Related terms\n   - Common applications\n\nWould you like me to elaborate on any part?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Context]\n\nLet me add some context to this definition:\n\n1. Historical Background:\n   - Origin and development\n   - Key contributors\n   - Evolution over time\n\n2. Modern Understanding:\n   - Current interpretations\n   - Recent developments\n   - Contemporary applications\n\n3. Practical Implications:\n   - How this affects your studies\n   - Real-world relevance\n   - Future developments\n\nWould you like to know more about any of these aspects?`,
          model: 'gemini' as const
        }
      },
      procedure: {
        chatGPT: {
          content: `[ChatGPT Step-by-Step Guide]\n\nLet me walk you through this process:\n\n1. Preparation:\n   - What you need to know\n   - Materials required\n   - Prerequisites\n\n2. Step-by-Step Instructions:\n   - Step 1: Detailed explanation\n   - Step 2: What to do\n   - Step 3: How to verify\n\n3. Tips and Best Practices:\n   - Common mistakes to avoid\n   - Pro tips\n   - Troubleshooting guide\n\nWould you like me to explain any step in more detail?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Alternative Methods]\n\nHere are some additional approaches:\n\n1. Alternative Methods:\n   - Different ways to achieve the same result\n   - When to use each method\n   - Pros and cons\n\n2. Advanced Techniques:\n   - More efficient approaches\n   - Expert tips\n   - Time-saving strategies\n\n3. Common Challenges:\n   - What to watch out for\n   - How to overcome obstacles\n   - When to ask for help\n\nWould you like to explore any of these alternatives?`,
          model: 'gemini' as const
        }
      },
      explanation: {
        chatGPT: {
          content: `[ChatGPT Explanation]\n\nLet me explain why this happens:\n\n1. Root Causes:\n   - Primary factors\n   - Contributing elements\n   - Underlying principles\n\n2. Process and Mechanism:\n   - How it works\n   - Step-by-step breakdown\n   - Key interactions\n\n3. Implications and Effects:\n   - Consequences\n   - Real-world impact\n   - Why it matters\n\nWould you like me to elaborate on any aspect?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Additional Context]\n\nLet me provide some additional context:\n\n1. Historical Perspective:\n   - How this developed\n   - Key discoveries\n   - Evolution over time\n\n2. Current Understanding:\n   - Modern interpretations\n   - Recent research\n   - Contemporary views\n\n3. Future Implications:\n   - Where this is heading\n   - Potential developments\n   - Areas for further study\n\nWould you like to explore any of these aspects?`,
          model: 'gemini' as const
        }
      },
      comparison: {
        chatGPT: {
          content: `[ChatGPT Comparison]\n\nLet me compare these concepts:\n\n1. Similarities:\n   - Common features\n   - Shared characteristics\n   - Overlapping aspects\n\n2. Differences:\n   - Key distinctions\n   - Unique features\n   - Contrasting elements\n\n3. When to Use Each:\n   - Best applications\n   - Appropriate contexts\n   - Practical considerations\n\nWould you like me to focus on any specific aspect?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Analysis]\n\nLet me provide additional insights:\n\n1. Critical Evaluation:\n   - Strengths and weaknesses\n   - Pros and cons\n   - Key considerations\n\n2. Practical Applications:\n   - Real-world examples\n   - Use cases\n   - Best practices\n\n3. Decision Making:\n   - How to choose\n   - Factors to consider\n   - Making the right choice\n\nWould you like to explore any of these aspects?`,
          model: 'gemini' as const
        }
      },
      example: {
        chatGPT: {
          content: `[ChatGPT Examples]\n\nLet me provide some examples:\n\n1. Basic Examples:\n   - Simple cases\n   - Clear illustrations\n   - Easy to understand\n\n2. Advanced Examples:\n   - Complex scenarios\n   - Real-world applications\n   - Detailed analysis\n\n3. Practice Problems:\n   - Try it yourself\n   - Step-by-step solutions\n   - Common variations\n\nWould you like more examples or a different type?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Additional Examples]\n\nHere are some more examples:\n\n1. Alternative Scenarios:\n   - Different contexts\n   - Various applications\n   - Unique cases\n\n2. Common Mistakes:\n   - What to avoid\n   - Typical errors\n   - How to correct them\n\n3. Advanced Applications:\n   - Complex uses\n   - Expert-level examples\n   - Cutting-edge applications\n\nWould you like to explore any of these further?`,
          model: 'gemini' as const
        }
      },
      study: {
        chatGPT: {
          content: `[ChatGPT Study Guide]\n\nLet me help you with your studies:\n\n1. Study Strategies:\n   - Effective methods\n   - Time management\n   - Note-taking tips\n\n2. Subject-Specific Tips:\n   - Key concepts\n   - Important formulas\n   - Common questions\n\n3. Exam Preparation:\n   - Practice questions\n   - Revision techniques\n   - Test-taking strategies\n\nWould you like me to focus on any specific area?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Learning Tips]\n\nHere are some additional learning strategies:\n\n1. Active Learning:\n   - Engagement techniques\n   - Practice methods\n   - Application exercises\n\n2. Memory Techniques:\n   - Mnemonics\n   - Visualization\n   - Association methods\n\n3. Long-term Retention:\n   - Spaced repetition\n   - Review strategies\n   - Application practice\n\nWould you like to explore any of these techniques?`,
          model: 'gemini' as const
        }
      },
      writing: {
        chatGPT: {
          content: `[ChatGPT Writing Assistant]\n\nLet me help you with your writing:\n\n1. Structure and Organization:\n   - Clear thesis statement\n   - Logical flow of ideas\n   - Strong supporting arguments\n\n2. Content Development:\n   - Evidence and examples\n   - Analysis and interpretation\n   - Critical thinking\n\n3. Writing Style:\n   - Grammar and mechanics\n   - Word choice and vocabulary\n   - Sentence structure\n\nWould you like me to focus on any specific aspect?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Writing Tips]\n\nHere are some additional writing strategies:\n\n1. Revision Techniques:\n   - Peer review guidelines\n   - Self-editing checklist\n   - Common mistakes to avoid\n\n2. Research Skills:\n   - Finding reliable sources\n   - Proper citation methods\n   - Integrating evidence\n\n3. Writing Process:\n   - Pre-writing strategies\n   - Drafting techniques\n   - Final editing tips\n\nWould you like to explore any of these areas?`,
          model: 'gemini' as const
        }
      },
      language: {
        chatGPT: {
          content: `[ChatGPT Language Learning]\n\nLet me help you with language learning:\n\n1. Speaking Practice:\n   - Pronunciation tips\n   - Conversation starters\n   - Common phrases\n\n2. Grammar and Vocabulary:\n   - Key grammar rules\n   - Essential vocabulary\n   - Word usage examples\n\n3. Cultural Context:\n   - Cultural nuances\n   - Social etiquette\n   - Real-world applications\n\nWould you like to focus on any specific area?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Language Tips]\n\nHere are additional language learning strategies:\n\n1. Immersion Techniques:\n   - Listening exercises\n   - Reading practice\n   - Writing activities\n\n2. Memory Techniques:\n   - Mnemonics\n   - Spaced repetition\n   - Association methods\n\n3. Practice Resources:\n   - Recommended apps\n   - Online resources\n   - Practice exercises\n\nWould you like to explore any of these?`,
          model: 'gemini' as const
        }
      },
      planning: {
        chatGPT: {
          content: `[ChatGPT Study Planner]\n\nLet me help you plan your studies:\n\n1. Time Management:\n   - Study schedule creation\n   - Priority setting\n   - Break planning\n\n2. Goal Setting:\n   - Short-term objectives\n   - Long-term goals\n   - Progress tracking\n\n3. Study Techniques:\n   - Active learning methods\n   - Review strategies\n   - Test preparation\n\nWould you like me to focus on any specific aspect?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Planning Tips]\n\nHere are additional planning strategies:\n\n1. Productivity Methods:\n   - Pomodoro technique\n   - Time blocking\n   - Task batching\n\n2. Organization Tools:\n   - Digital planners\n   - Study apps\n   - Progress trackers\n\n3. Motivation Strategies:\n   - Goal visualization\n   - Reward systems\n   - Accountability methods\n\nWould you like to explore any of these?`,
          model: 'gemini' as const
        }
      },
      special_ed: {
        chatGPT: {
          content: `[ChatGPT Special Education Support]\n\nLet me help you with special education needs:\n\n1. Learning Adaptations:\n   - Content modifications\n   - Alternative formats\n   - Assistive technologies\n\n2. Support Strategies:\n   - Individualized approaches\n   - Multi-sensory learning\n   - Progress monitoring\n\n3. Resource Recommendations:\n   - Specialized tools\n   - Support services\n   - Community resources\n\nWould you like me to focus on any specific area?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Additional Support]\n\nHere are more support strategies:\n\n1. Accessibility Tools:\n   - Text-to-speech\n   - Speech-to-text\n   - Screen readers\n\n2. Learning Techniques:\n   - Visual aids\n   - Hands-on activities\n   - Interactive methods\n\n3. Support Networks:\n   - Professional services\n   - Peer support\n   - Family resources\n\nWould you like to explore any of these?`,
          model: 'gemini' as const
        }
      },
      resources: {
        chatGPT: {
          content: `[ChatGPT Educational Resources]\n\nLet me help you find learning resources:\n\n1. Digital Resources:\n   - Online textbooks\n   - Educational videos\n   - Interactive tools\n\n2. Study Materials:\n   - Practice exercises\n   - Study guides\n   - Reference materials\n\n3. Learning Platforms:\n   - Educational websites\n   - Learning apps\n   - Online courses\n\nWould you like me to focus on any specific type of resource?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Resource Recommendations]\n\nHere are additional resource suggestions:\n\n1. Interactive Learning:\n   - Virtual labs\n   - Simulations\n   - Educational games\n\n2. Community Resources:\n   - Study groups\n   - Tutoring services\n   - Learning communities\n\n3. Advanced Tools:\n   - Research databases\n   - Academic journals\n   - Professional networks\n\nWould you like to explore any of these?`,
          model: 'gemini' as const
        }
      },
      tracking: {
        chatGPT: {
          content: `[ChatGPT Progress Tracking]\n\nLet me help you track learning progress:\n\n1. Performance Metrics:\n   - Assessment tracking\n   - Skill development\n   - Goal achievement\n\n2. Progress Analysis:\n   - Strengths identification\n   - Areas for improvement\n   - Growth patterns\n\n3. Reporting Tools:\n   - Progress reports\n   - Achievement tracking\n   - Feedback systems\n\nWould you like me to focus on any specific aspect?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Tracking Tips]\n\nHere are additional tracking strategies:\n\n1. Data Visualization:\n   - Progress charts\n   - Performance graphs\n   - Trend analysis\n\n2. Feedback Systems:\n   - Regular check-ins\n   - Progress reviews\n   - Goal adjustments\n\n3. Support Resources:\n   - Tracking tools\n   - Reporting systems\n   - Communication platforms\n\nWould you like to explore any of these?`,
          model: 'gemini' as const
        }
      },
      teaching: {
        chatGPT: {
          content: `[ChatGPT Teaching Assistant]\n\nLet me help you with teaching strategies:\n\n1. Lesson Planning:\n   - Curriculum design\n   - Activity creation\n   - Assessment development\n\n2. Classroom Management:\n   - Engagement techniques\n   - Behavior strategies\n   - Group dynamics\n\n3. Teaching Methods:\n   - Differentiated instruction\n   - Active learning\n   - Assessment techniques\n\nWould you like me to focus on any specific area?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Teaching Tips]\n\nHere are additional teaching strategies:\n\n1. Professional Development:\n   - Teaching resources\n   - Training opportunities\n   - Best practices\n\n2. Student Support:\n   - Individualized help\n   - Group activities\n   - Special needs support\n\n3. Classroom Technology:\n   - Digital tools\n   - Interactive resources\n   - Assessment platforms\n\nWould you like to explore any of these?`,
          model: 'gemini' as const
        }
      },
      content: {
        chatGPT: {
          content: `[ChatGPT Content Creation]\n\nLet me help you create educational content:\n\n1. Content Development:\n   - Lesson planning\n   - Activity design\n   - Resource creation\n\n2. Engagement Strategies:\n   - Interactive elements\n   - Multimedia integration\n   - Assessment tools\n\n3. Curriculum Alignment:\n   - Standards matching\n   - Learning objectives\n   - Progress tracking\n\nWould you like me to focus on any specific area?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Content Tips]\n\nHere are additional content creation strategies:\n\n1. Digital Tools:\n   - Authoring platforms\n   - Multimedia tools\n   - Assessment systems\n\n2. Content Types:\n   - Interactive lessons\n   - Practice exercises\n   - Assessment materials\n\n3. Distribution Methods:\n   - Learning platforms\n   - Content sharing\n   - Student access\n\nWould you like to explore any of these?`,
          model: 'gemini' as const
        }
      },
      general: {
        chatGPT: {
          content: `[ChatGPT Analysis]\n\nLet me help you with your question about "${messageContent}".\n\n1. Understanding the Topic:\n   - Key concepts and definitions\n   - Important relationships and connections\n   - Why this matters in your studies\n\n2. Detailed Explanation:\n   - Step-by-step breakdown\n   - Examples and illustrations\n   - Common applications\n\n3. Learning Support:\n   - Study tips and techniques\n   - Practice exercises\n   - Additional resources\n\nWould you like me to focus on any specific aspect?`,
          model: 'chatgpt' as const
        },
        gemini: {
          content: `[Gemini Insights]\n\nLet me provide additional perspectives on "${messageContent}".\n\n1. Alternative Approaches:\n   - Different ways to understand the topic\n   - Visual learning aids\n   - Real-world connections\n\n2. Critical Analysis:\n   - Key points to remember\n   - Common mistakes to avoid\n   - How to verify your understanding\n\n3. Practical Applications:\n   - How to apply this knowledge\n   - Study strategies\n   - Exam preparation tips\n\nWould you like to explore any of these aspects further?`,
          model: 'gemini' as const
        }
      }
    };

    return responses[type] || responses.general;
  };

  const updateConversation = (
    message: string,
    chatGPTResponse: { content: string; model: 'chatgpt' | 'gemini' },
    geminiResponse: { content: string; model: 'chatgpt' | 'gemini' }
  ) => {
    if (!selectedConversation) return;

    const updatedConversation = {
      ...selectedConversation,
      messages: [
        ...selectedConversation.messages,
        {
          id: `test-message-${Date.now()}`,
          content: message,
          role: 'user' as const,
          created_at: new Date().toISOString(),
          model
        },
        {
          id: `test-response-chatgpt-${Date.now()}`,
          content: chatGPTResponse.content,
          role: 'assistant' as const,
          created_at: new Date().toISOString(),
          model: chatGPTResponse.model
        },
        {
          id: `test-response-gemini-${Date.now()}`,
          content: geminiResponse.content,
          role: 'assistant' as const,
          created_at: new Date().toISOString(),
          model: geminiResponse.model
        }
      ]
    };
    
    setSelectedConversation(updatedConversation);
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
  };

  const renderUserInfo = () => {
    if (!userInfo) return null;

    switch (userInfo.role) {
      case 'teacher':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Teacher Dashboard - {userInfo.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Classroom Information</h3>
                <p>Classroom ID: {userInfo.classroomId}</p>
                <p>Number of Students: {userInfo.students?.length || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Student Progress</h3>
                {userInfo.students?.map((student: any) => (
                  <div key={student.id} className="mb-2">
                    <p>{student.name}: {student.progress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'parent':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Parent Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userInfo.children?.map((child: any) => (
                <div key={child.id} className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{child.name}</h3>
                  <p>Classroom: {child.classroom}</p>
                  <p>Progress: {child.progress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${child.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'student':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Student Dashboard - {userInfo.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Classroom Information</h3>
                <p>Classroom ID: {userInfo.classroomId}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Subject Progress</h3>
                {userInfo.progress && Object.entries(userInfo.progress).map(([subject, score]: [string, any]) => (
                  <div key={subject} className="mb-2">
                    <p className="capitalize">{subject}: {score}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showClassroomForm) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Enter Classroom ID</h2>
          <form onSubmit={handleClassroomSubmit} className="space-y-4">
            <div>
              <label htmlFor="classroomId" className="block text-sm font-medium text-gray-700">
                Classroom ID
              </label>
              <input
                type="text"
                id="classroomId"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your classroom ID"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Join Classroom
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderUserInfo()}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Classroom ID: {classroomId}</span>
            <button
              onClick={() => setShowClassroomForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Change Classroom
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Conversations</h2>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {conversation.title}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-3 bg-white rounded-lg shadow-md p-4">
            {selectedConversation ? (
              <>
                <div className="h-[calc(100vh-300px)] overflow-y-auto mb-4 space-y-4">
                  {selectedConversation.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-indigo-50' 
                          : message.model === 'chatgpt'
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : 'bg-green-50 border-l-4 border-green-500'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <span className="font-semibold">
                          {message.role === 'user' 
                            ? 'You' 
                            : message.model === 'chatgpt'
                              ? 'ChatGPT'
                              : 'Gemini'}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-line text-gray-800">
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-300px)]">
                <p className="text-gray-500">Select a conversation or start a new one</p>
              </div>
            )}
          </div>
