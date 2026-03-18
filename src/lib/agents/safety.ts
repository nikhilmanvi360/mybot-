// ─── Safety Filter ──────────────────────────────────────────

const BLOCKED_PATTERNS = [
    /\b(hack|exploit|attack|breach|ddos)\b.*\b(system|server|network|website)\b/i,
    /\b(make|create|build)\b.*\b(virus|malware|trojan|ransomware)\b/i,
    /\b(steal|phish)\b.*\b(password|credential|data|identity)\b/i,
    /\b(self[- ]?harm|suicide)\b/i,
];

const MAX_INPUT_LENGTH = 4000;

export interface SafetyResult {
    safe: boolean;
    reason?: string;
    sanitized?: string;
}

export function validateInput(input: string): SafetyResult {
    // Length check
    if (input.length > MAX_INPUT_LENGTH) {
        return {
            safe: false,
            reason: `Message too long (${input.length} chars). Maximum is ${MAX_INPUT_LENGTH}.`,
        };
    }

    // Empty check
    if (!input.trim()) {
        return { safe: false, reason: 'Message cannot be empty.' };
    }

    // Pattern check
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(input)) {
            return {
                safe: false,
                reason: "I can't help with that type of request. Let's focus on something constructive!",
            };
        }
    }

    return { safe: true, sanitized: input.trim() };
}

export function validateOutput(output: string): SafetyResult {
    // Check for potential PII leakage patterns
    const piiPatterns = [
        /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN-like
        /\b\d{16}\b/, // Credit card-like
    ];

    for (const pattern of piiPatterns) {
        if (pattern.test(output)) {
            return {
                safe: true,
                sanitized: output.replace(pattern, '[REDACTED]'),
                reason: 'Sensitive data pattern redacted.',
            };
        }
    }

    return { safe: true, sanitized: output };
}
