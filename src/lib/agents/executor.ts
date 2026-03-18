import OpenAI from 'openai';
import { AgentMode, PlanStep } from './types';
import { getExecutorPrompt } from '../prompts';
import { getConversationContext } from './memory';
import { AVAILABLE_TOOLS } from './tools';

// ─── Executor Agent ─────────────────────────────────────────

function getOpenAI() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
}

export async function executeStep(
    sessionId: string,
    mode: AgentMode,
    step: PlanStep,
    previousResults: string = ''
): Promise<ReadableStream<Uint8Array>> {
    const context = await getConversationContext(sessionId, 8);
    const prompt = getExecutorPrompt(mode, step.title, step.description, context, previousResults);
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const openai = getOpenAI();
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                    { role: 'system', content: prompt },
                    { role: 'user', content: `Execute this step: "${step.title}" — ${step.description}` },
                ];

                let turn = 0;
                let maxTurns = 5;

                while (turn < maxTurns) {
                    turn++;
                    const response = await openai.chat.completions.create({
                        model,
                        messages,
                        tools: AVAILABLE_TOOLS as any,
                        tool_choice: 'auto',
                        stream: true,
                    });

                    let fullContent = '';
                    let toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];

                    for await (const chunk of response) {
                        const delta = chunk.choices[0]?.delta;
                        if (delta?.content) {
                            fullContent += delta.content;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
                        }

                        if (delta?.tool_calls) {
                            for (const toolCallDelta of delta.tool_calls) {
                                const index = toolCallDelta.index;
                                if (!toolCalls[index]) {
                                    toolCalls[index] = {
                                        id: toolCallDelta.id || '',
                                        type: 'function',
                                        function: { name: '', arguments: '' },
                                    };
                                }
                                if (toolCallDelta.id) {
                                    toolCalls[index].id = toolCallDelta.id;
                                }
                                if (toolCallDelta.function?.name) {
                                    toolCalls[index].function.name = toolCallDelta.function.name;
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ toolCall: { name: toolCallDelta.function.name, status: 'running' } })}\n\n`));
                                }
                                if (toolCallDelta.function?.arguments) {
                                    toolCalls[index].function.arguments += toolCallDelta.function.arguments;
                                }
                            }
                        }
                    }


                    if (toolCalls.length > 0) {
                        // Add assistant message with tool calls
                        messages.push({
                            role: 'assistant',
                            tool_calls: toolCalls,
                            content: fullContent || null,
                        });

                        // Execute tools and add results to messages
                        for (const toolCall of toolCalls) {
                            const availableTool = AVAILABLE_TOOLS.find(t => t.function.name === toolCall.function.name);
                            if (availableTool) {
                                const args = JSON.parse(toolCall.function.arguments);
                                const result = await availableTool.function.function(args);
                                messages.push({
                                    role: 'tool',
                                    tool_call_id: toolCall.id,
                                    content: result,
                                });
                            }
                        }
                        // Continue to next turn to get model's reaction to tool results
                        continue;
                    }

                    // No tool calls, finish
                    break;
                }

                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (err) {
                console.error('Executor Stream Error:', err);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`));
                controller.close();
            }
        },
    });
}


export async function executeDirectResponse(
    sessionId: string,
    mode: AgentMode,
    userMessage: string
): Promise<ReadableStream<Uint8Array>> {
    const context = await getConversationContext(sessionId, 8);
    const { getSystemPrompt } = await import('../prompts');
    const systemPrompt = getSystemPrompt(mode);
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const openai = getOpenAI();
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                    { role: 'system', content: systemPrompt },
                    ...(context
                        ? [{ role: 'user' as const, content: `Previous context:\n${context}` }]
                        : []),
                    { role: 'user', content: userMessage },
                ];

                let turn = 0;
                const maxTurns = 5;

                while (turn < maxTurns) {
                    turn++;
                    const response = await openai.chat.completions.create({
                        model,
                        messages,
                        tools: AVAILABLE_TOOLS as any,
                        tool_choice: 'auto',
                        stream: true,
                    });

                    let fullContent = '';
                    let toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];

                    for await (const chunk of response) {
                        const delta = chunk.choices[0]?.delta;
                        if (delta?.content) {
                            fullContent += delta.content;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
                        }

                        if (delta?.tool_calls) {
                            for (const toolCallDelta of delta.tool_calls) {
                                const index = toolCallDelta.index;
                                if (!toolCalls[index]) {
                                    toolCalls[index] = {
                                        id: toolCallDelta.id || '',
                                        type: 'function',
                                        function: { name: '', arguments: '' },
                                    };
                                }
                                if (toolCallDelta.id) {
                                    toolCalls[index].id = toolCallDelta.id;
                                }
                                if (toolCallDelta.function?.name) {
                                    toolCalls[index].function.name = toolCallDelta.function.name;
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ toolCall: { name: toolCallDelta.function.name, status: 'running' } })}\n\n`));
                                }
                                if (toolCallDelta.function?.arguments) {
                                    toolCalls[index].function.arguments += toolCallDelta.function.arguments;
                                }
                            }
                        }
                    }


                    if (toolCalls.length > 0) {
                        messages.push({
                            role: 'assistant',
                            tool_calls: toolCalls,
                            content: fullContent || null,
                        });

                        for (const toolCall of toolCalls) {
                            const availableTool = AVAILABLE_TOOLS.find(t => t.function.name === toolCall.function.name);
                            if (availableTool) {
                                const args = JSON.parse(toolCall.function.arguments);
                                const result = await availableTool.function.function(args);
                                messages.push({
                                    role: 'tool',
                                    tool_call_id: toolCall.id,
                                    content: result,
                                });
                            }
                        }
                        continue;
                    }
                    break;
                }

                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (err) {
                console.error('Executor DirectResponse Error:', err);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`));
                controller.close();
            }
        },
    });
}


