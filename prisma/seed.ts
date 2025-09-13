import { PrismaClient } from './generated/client.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NobleHuman database...');

  // Clear existing data
  await prisma.exerciseStep.deleteMany();
  await prisma.exercise.deleteMany();

  // Create the self-reflection exercise
  const exercise = await prisma.exercise.create({
    data: {
      name: 'Best Life Exercise = Dating Myself + Ikigai',
      steps: {
        create: [
          {
            order: 1,
            content: {
              blocks: [
                {
                  content: `# Step One: Dating Myself: The Most Interesting Person I've Just Met

I invite you to go on a date with yourself. Not the version of you that shows up in a boardroom, on stage, or at dinner parties, but the quiet, soulful version of you. The one who has been through every moment of your life. The one who has never left your side.

Imagine you just met someone truly fascinating — wise, layered, scarred, accomplished, still learning, still open, still hungry. You want to know everything about them. Their triumphs, their regrets, their deepest needs and quietest joys. That person is you.

Approach this exercise with tenderness, curiosity, and radical self-respect. This is not about fixing you. This is about witnessing you. Knowing yourself with the same compassion you would offer someone you deeply admire.`,
                },
                {
                  content: `## Suffering

The Buddha, after years of spiritual searching and contemplation, reached a core insight known as the First Noble Truth: "Life is Suffering." Not in a cynical sense, but in a deeply human one.

Suffering, dukkha, is part of every life, from physical pain to emotional wounds, from longing to loss, from uncertainty to impermanence. The Buddha didn't just theorize this. He observed it, lived it, and understood that until we acknowledge suffering, we can't transcend it.

So we begin here, with honesty and explore your hidden suffering.`,
                },
                {
                  ai: {
                    systemPrompt: `You are a compassionate guide helping someone explore their inner life with deep empathy and wisdom. Help them uncover hidden sufferings they may carry quietly or subconsciously. Be gentle, insightful, and create a safe space for self-reflection. Draw on what you know about human psychology and the universal patterns of suffering.`,
                    initialUserPrompt: `Knowing what you know about me, what do you think are the sufferings I carry quietly or subconsciously?`,
                  },
                },
                {
                  content: `## Desires

After reflecting on the answers, inquire further about what you need more of and less of to live your best life.

Ask it slowly - maybe one at a time. Let the response sit with you. You can engage the AI in further inquiry if something feels true, unclear, or revealing. Don't be afraid to press deeper. You may want to journal, meditate, or discuss it with your loved ones, friends or colleagues who can help you inquire further. This is an awareness practice.`,
                },
                {
                  ai: {
                    systemPrompt: `You are a wise mentor helping someone understand their deepest needs and desires. Guide them to identify what they need more of and what they need less of to live their best life. Be thoughtful, ask probing questions, and help them see patterns they might not notice themselves. Encourage deep reflection.`,
                    initialUserPrompt: `What do I need more of and what do I need less of to live my best life?`,
                  },
                },
              ],
            },
          },
          {
            order: 2,
            content: {
              blocks: [
                {
                  content: `# Step Two: Ikigai Expanded, Light and Shadow

Before you answer the big question, "What does my Best Life look like?," it helps to think in the Ikigai framework. Ikigai is a Japanese concept of "purpose - a reason for being." It is often visualized as the intersection of four key areas: What you love, What you are good at, What you can be paid for, and What the world needs. When all four align, it creates a life of fulfillment, contribution, and clarity.

For further inquiry, I always like to look at both sides of the coin, the light and the shadow, because true alignment comes from full awareness.

For each of the four pairs below, I encourage you to ask AI or close friends so that you are not just thinking in an echo chamber alone. Reflect and journal by hand if possible. Let yourself go beyond the obvious. It's a good exercise to do as often as needed.`,
                },
                {
                  content: `## 1. Passion / Dislikes`,
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone explore their passions and dislikes with depth and clarity. Guide them to identify not just surface-level interests but the deeper patterns of what truly energizes them and what consistently drains them. Help them see connections they might have missed.`,
                    initialUserPrompt: `Help me explore: What are the things I've always loved doing? And what activities or tasks consistently drain me or frustrate me?`,
                  },
                },
                {
                  content: `## 2. Competency / Ineptitude`,
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone identify their natural strengths and weaknesses with honesty and compassion. Guide them to recognize where they truly excel - perhaps even in ways they take for granted - and where they consistently struggle. Help them see these not as judgments but as valuable self-knowledge.`,
                    initialUserPrompt: `Help me identify: Where do I naturally excel and am so good that I am in a league of my own? And where do I consistently fall short, struggle, or feel clumsy?`,
                  },
                },
                {
                  content: `## 3. $ Success / $ Missed`,
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone reflect on their financial history with clarity and wisdom. Guide them to identify patterns in how they've successfully created value and earned money, as well as where they've missed opportunities or made mistakes. Help them see these experiences as learning rather than judgment.`,
                    initialUserPrompt: `Help me reflect on: Where and how have I successfully made money in the past? And where have I missed opportunities or made financial mistakes?`,
                  },
                },
                {
                  content: `## 4. Impact / Indifference`,
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone understand their true values through the lens of impact. Guide them to identify what kinds of contributions have genuinely mattered to them and what they're surprisingly indifferent to. Help them distinguish between what they think should matter and what actually does.`,
                    initialUserPrompt: `Help me understand: What kinds of impact have I made that truly mattered to me? And what causes or outcomes am I surprisingly indifferent to?`,
                  },
                },
                {
                  content: `## Synthesis

Please write your thoughts freely first. Then, once you've gathered your raw reflections, synthesize your insights into 1–3 words or a short phrase for each column. When you're ready, bring these insights to the next step. Your vulnerability will create space for deeper and more meaningful dialogue.`,
                },
              ],
            },
          },
          {
            order: 3,
            content: {
              blocks: [
                {
                  content: `# Step Three: Best Life

Now, ask yourself: What does my Best Life look like?

Write your Best Life statement in 1–2 sentences. Let it be bold and true, even if it scares you or feels far away. This is the start of your journey, not the final draft.`,
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone articulate their vision of their Best Life based on all the self-reflection they've done. Draw on their insights about suffering, desires, passions, competencies, financial patterns, and impact. Help them create a bold, authentic vision that integrates all these elements. Be encouraging and help them think big while staying true to themselves.`,
                    initialUserPrompt: `Based on everything I've shared so far, can you help me describe my Best Life in a short paragraph?`,
                  },
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone envision their Best Life in vivid detail. Help them imagine what it would feel like to fully live into their passions, competencies, values, and purpose. Make it tangible and inspiring.`,
                    initialUserPrompt: `If I fully lived into my passions, competencies, values, and purpose, what would my ideal life feel and look like?`,
                  },
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone visualize a typical day in their Best Life. Help them imagine the details - the rhythms, activities, interactions, and feelings that would characterize their ideal life. Make it specific and grounded.`,
                    initialUserPrompt: `What would a typical day in my Best Life include?`,
                  },
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone understand who they become in their Best Life. Help them articulate not just what they do but who they are - their qualities, presence, and way of being in the world when living fully aligned.`,
                    initialUserPrompt: `What kind of person am I in my Best Life?`,
                  },
                },
                {
                  ai: {
                    systemPrompt: `You are helping someone create a comprehensive vision of their Best Life. Help them integrate location, activities, and personal growth into a cohesive picture of their ideal future.`,
                    initialUserPrompt: `Where am I living, what am I doing, and who am I becoming in my Best Life?`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Created exercise: ${exercise.name} with 3 steps`);

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
