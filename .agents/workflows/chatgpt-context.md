---
description: Append a ChatGPT context summary at the end of every response
---

# ChatGPT Context Block

After completing every user prompt, append a context summary block at the end of the response.

## Format

```
---

## 📋 ChatGPT Context Update

**Last action**: [what was just done]
**Files created/modified**: [list of files]
**Current project state**: [what's working]
**What's NOT done yet**: [remaining work]
**Next logical step**: [what ChatGPT should prompt for next]
```

## Rules

1. Always include this block at the end of every response
2. Keep it concise — bullet points, not paragraphs
3. Be honest about what is implemented vs what is just documented
4. List specific file paths when files were created or modified
5. The "Next logical step" should help ChatGPT generate the next prompt
