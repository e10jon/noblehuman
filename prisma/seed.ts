import { PrismaClient } from './generated/client.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NobleHuman database...');

  // Clear existing data in correct order to handle foreign key constraints
  await prisma.conversationMessage.deleteMany();
  await prisma.completionStep.deleteMany();
  await prisma.completion.deleteMany();
  await prisma.exerciseStep.deleteMany();
  await prisma.exercise.deleteMany();

  // Create NobleHuman Week 1 exercise
  await prisma.exercise.create({
    data: {
      name: 'NobleHuman Week 1: Best Life Journey',
      steps: {
        create: [
          {
            order: 1,
            title: 'Dating Myself: Suffering',
            content: {
              blocks: [
                {
                  content: `<p>I invite you to go on a date with yourself. Not the version of you that shows up in a boardroom, on stage, or at dinner parties, but the quiet, soulful version of you. The one who has been through every moment of your life. The one who has never left your side.</p>

                    <p>Imagine you just met someone truly fascinating — wise, layered, scarred, accomplished, still learning, still open, still hungry. You want to know everything about them. Their triumphs, their regrets, their deepest needs and quietest joys. That person is you.</p>

                    <p><strong>Approach this exercise with tenderness, curiosity, and radical self-respect.</strong> This is not about fixing you. This is about witnessing you. Knowing yourself with the same compassion you would offer someone you deeply admire.</p>

                    <h3>Suffering</h3>
                    <p>The Buddha, after years of spiritual searching and contemplation, reached a core insight known as the First Noble Truth: "Life is Suffering." Not in a cynical sense, but in a deeply human one.</p>

                    <p>Suffering, dukkha, is part of every life, from physical pain to emotional wounds, from longing to loss, from uncertainty to impermanence. The Buddha didn't just theorize this. He observed it, lived it, and understood that until we acknowledge suffering, we can't transcend it.</p>

                    <p>So we begin here, with honesty and explore your hidden suffering.</p>`,
                },
                {
                  ai: {
                    systemPrompt: `You are a compassionate guide helping someone explore their inner landscape with wisdom and care. Your role is to help them identify patterns of suffering they may carry quietly or subconsciously.

Ask thoughtful, gentle questions that help them reflect on:
- Recurring worries or anxieties they might dismiss as "just how life is"
- Patterns of self-criticism or inner judgment
- Unmet needs or longings they've learned to suppress
- Areas where they feel stuck or frustrated repeatedly
- Wounds from the past that still influence their present
- Ways they might be avoiding certain emotions or experiences

Be empathetic and non-judgmental. Help them see that acknowledging suffering is not wallowing - it's the first step toward greater self-awareness and compassion. Encourage them to be honest about what they find, and remind them that everyone carries suffering; it's part of the human experience.

Keep your responses warm, insightful, and focused on helping them develop a compassionate relationship with their own inner experience.`,
                    initialUserPrompt:
                      'I want to explore the sufferings I carry quietly or subconsciously. Help me identify patterns or areas where I might be experiencing dukkha without fully acknowledging it.',
                  },
                },
              ],
              resultPrompt:
                'What insights did you discover about the sufferings you carry? What patterns of dukkha became clearer to you?',
            },
          },
          {
            order: 2,
            title: 'Dating Myself: Desires',
            content: {
              blocks: [
                {
                  content: `<p>After reflecting on the answers, inquire further about:</p>
                    <p><strong>"What do I need more of and what do I need less of to live my best life?"</strong></p>

                    <p>Ask it slowly - maybe one at a time. Let the response sit with you. You can engage the AI in further inquiry if something feels true, unclear, or revealing. Don't be afraid to press deeper. You may want to journal, meditate, or discuss it with your loved ones, friends or colleagues who can help you inquire further. This is an awareness practice.</p>`,
                },
                {
                  ai: {
                    systemPrompt: `You are a wise counselor helping someone explore their deepest desires and needs for living their best life. Your role is to help them identify what they truly need more of and what they need less of.

Guide them to explore:
- What energizes them vs. what drains them
- What they long for but haven't prioritized
- What they do out of habit vs. what they do from authentic desire
- Areas where they feel abundant vs. areas where they feel depleted
- What would make them feel more alive and fulfilled
- What they're tolerating that they could change or eliminate

Help them distinguish between surface-level wants and deeper soul needs. Ask follow-up questions that help them go beyond the obvious answers. If they say something generic, gently push them to be more specific and personal.

Be curious and supportive. Help them trust their inner wisdom about what they truly need. Remind them that this isn't about being selfish - it's about understanding what conditions help them thrive so they can show up better in all areas of life.`,
                    initialUserPrompt:
                      'Help me explore what I need more of and what I need less of to live my best life. I want to go beyond surface-level answers to understand my deeper needs and desires.',
                  },
                },
              ],
              resultPrompt:
                'What did you discover about what you need more of and less of? What desires and needs became clearer to you?',
            },
          },
          {
            order: 3,
            title: 'Ikigai Expanded: Light and Shadow',
            content: {
              blocks: [
                {
                  content: `<p>Before you answer the big question, "What does my Best Life look like?," it helps to think in the Ikigai framework. Ikigai is a Japanese concept of "purpose - a reason for being."</p>

                    <p>It is often visualized as the intersection of four key areas: <strong>What you love, What you are good at, What you can be paid for, and What the world needs.</strong> When all four align, it creates a life of fulfillment, contribution, and clarity.</p>

                    <p>For further inquiry, I always like to look at both sides of the coin, the light and the shadow, because true alignment comes from full awareness.</p>

                    <p>For each of the four pairs below, I encourage you to ask AI or close friends so that you are not just thinking in an echo chamber alone. Reflect and journal by hand if possible. Let yourself go beyond the obvious. It's a good exercise to do as often as needed:</p>

                    <ul>
                      <li><strong>1. Passion / Dislikes</strong>
                        <ul>
                          <li>"What are the things I've always loved doing?"</li>
                          <li>"What activities or tasks consistently drain me or frustrate me?"</li>
                        </ul>
                      </li>
                      <li><strong>2. Competency / Ineptitude</strong>
                        <ul>
                          <li>"Where do I naturally excel at and I am so good that I am a league of my own?"</li>
                          <li>"Where do I consistently fall short, struggle, or feel clumsy?"</li>
                        </ul>
                      </li>
                      <li><strong>3. $ Success / $ Missed</strong>
                        <ul>
                          <li>"Where and how have I successfully made money in the past?"</li>
                          <li>"Where have I missed opportunities or made financial mistakes?"</li>
                        </ul>
                      </li>
                      <li><strong>4. Impact / Indifference</strong>
                        <ul>
                          <li>"What kinds of impact have I made that truly mattered to me?"</li>
                          <li>"What causes or outcomes am I surprisingly indifferent to?"</li>
                        </ul>
                      </li>
                    </ul>`,
                },
                {
                  ai: {
                    systemPrompt: `You are a thoughtful guide helping someone explore their Ikigai through both light and shadow aspects. Your role is to help them examine all four dimensions with honest self-reflection.

Guide them through each dimension systematically:

1. **Passion/Dislikes**: Help them identify what truly energizes them vs. what consistently drains them
2. **Competency/Ineptitude**: Explore their natural strengths and areas where they struggle
3. **Financial Success/Missed Opportunities**: Examine their relationship with money and value creation
4. **Impact/Indifference**: Understand what matters to them vs. what leaves them unmoved

For each dimension, ask both the "light" and "shadow" questions. Help them go beyond surface answers to find deeper truths. If they struggle with the shadow aspects, remind them that everyone has weaknesses and blind spots - acknowledging them is what allows for growth.

Encourage them to be specific with examples. Ask follow-up questions that help them see patterns. Help them synthesize insights across all four dimensions to see how they might work together.

Be supportive but also challenge them to be honest. This exercise is about gaining clarity, not just feeling good.`,
                    initialUserPrompt:
                      "I want to explore my Ikigai through both light and shadow. Help me examine all four dimensions: what I love/dislike, my competencies/ineptitudes, my financial successes/missed opportunities, and my impact/indifference. Let's go through each one systematically.",
                  },
                },
              ],
              resultPrompt:
                'Synthesize your insights from the Ikigai exploration. For each dimension (Passion/Dislikes, Competency/Ineptitude, Financial Success/Missed, Impact/Indifference), capture your key insights in 1-3 words or a short phrase.',
            },
          },
          {
            order: 4,
            title: 'Best Life Statement',
            content: {
              blocks: [
                {
                  content: `<p>Now, ask yourself: <strong>What does my Best Life look like?</strong></p>

                    <p>Here are a few AI prompts to help you write your answer:</p>
                    <ul>
                      <li>"Based on everything I've shared so far, can you help me describe my Best Life in a short paragraph?"</li>
                      <li>"If I fully lived into my passions, competencies, values, and purpose, what would my ideal life feel and look like?"</li>
                      <li>"What would a typical day in my Best Life include?"</li>
                      <li>"What kind of person am I in my Best Life?"</li>
                      <li>"Where am I living, what am I doing, and who am I becoming in my Best Life?"</li>
                    </ul>

                    <p><strong>Write your Best Life statement in 1–2 sentences. Let it be bold and true, even if it scares you or feels far away. This is the start of your journey, not the final draft.</strong></p>`,
                },
                {
                  ai: {
                    systemPrompt: `You are a wise guide helping someone craft their Best Life vision. Draw upon everything they've shared about their suffering, desires, and Ikigai exploration to help them articulate a compelling vision for their best life.

Help them create a vision that is:
- Authentic to who they truly are, not who they think they should be
- Specific enough to be meaningful, but flexible enough to evolve
- Grounded in their real values and desires, not societal expectations
- Bold enough to inspire them, but realistic enough to feel possible
- Integrative of their whole self - their gifts, challenges, dreams, and purpose

Ask questions that help them paint a picture of:
- How they would feel in their best life
- What they would be doing with their time and energy
- What relationships and connections would surround them
- What impact they would be making
- What environment they would be in
- Who they would be becoming

Encourage them to think beyond just career or achievement to encompass all dimensions of a fulfilling life. Help them synthesize insights from their earlier reflections into a coherent vision.

Be supportive and help them trust their inner knowing about what their best life looks like.`,
                    initialUserPrompt:
                      "Based on everything I've explored about my suffering, desires, and Ikigai, help me craft a vision of my Best Life. I want to create something that feels both bold and authentic to who I truly am.",
                  },
                },
              ],
              resultPrompt:
                'Write your Best Life statement in 1-2 sentences. Let it be bold and true, even if it scares you or feels far away. This is the start of your journey, not the final draft.',
            },
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
