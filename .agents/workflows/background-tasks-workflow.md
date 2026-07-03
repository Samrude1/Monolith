# Background Tasks Workflow (AWS SQS + Lambda)

Since we are avoiding third-party SaaS like Trigger.dev, all background jobs are handled via AWS SQS queues and Lambda workers.

1. **Architect** (`/architect`):
   - Define the event payload schema.
   - Identify the Queue Name and Lambda Function Name.
   - Plan the Dead Letter Queue (DLQ) and retry policy.

2. **Develop**:
   - **Producer**: Implement the code in Next.js/FastAPI to dispatch the message to SQS.
   - **Consumer**: Write the Lambda handler code.
   - Ensure the consumer is idempotent (can be safely retried).

3. **Review & Imprint** (`/review`, `/remember` save):
   - Review the architecture.
   - Document the new queue and its purpose in a central architecture document if necessary. Save session memory.
