import { Plus } from "lucide-react";

const questions = [
  [
    "When should we involve BIM4C?",
    "You can start at planning, design, construction or handover. Tell us your current stage and the decisions ahead so we can discuss where BIM support would be most useful.",
  ],
  [
    "What should we prepare for the first conversation?",
    "A short project overview, your current stage, key milestones and the challenges you want to resolve. Existing models or BIM requirements can help, but you do not need a complete brief to get in touch.",
  ],
  [
    "Can we discuss support for one part of a project?",
    "Yes. Your enquiry can focus on a specific need such as BIM planning, model coordination, team training or asset information. The scope and responsibilities can be agreed around that need.",
  ],
  [
    "How are scope, fees and deliverables agreed?",
    "These depend on the project stage, scale, available information and level of support required. The initial conversation helps clarify these inputs before a proposal is prepared.",
  ],
];

export function ServiceFaq() {
  return (
    <section
      className="border-t bg-white py-12 lg:py-16"
      aria-labelledby="service-faq-title"
    >
      <div className="site-container grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div>
          <p className="eyebrow">Before we begin</p>
          <h2 id="service-faq-title" className="section-title">
            A few useful answers.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Know what to expect before starting a conversation.
          </p>
        </div>
        <div className="divide-y border-y">
          {questions.map(([question, answer]) => (
            <details key={question} className="group py-1">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                {question}
                <Plus
                  className="size-5 shrink-0 text-primary transition-transform group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
