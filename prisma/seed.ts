import { PrismaClient } from './generated/client.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NobleHuman database...');

  // Clear existing data
  await prisma.exerciseStep.deleteMany();
  await prisma.exercise.deleteMany();

  // Create main exercise
  const exercise = await prisma.exercise.create({
    data: {
      name: 'Best Life Discovery Journey',
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
              ],
            },
          },
          {
            order: 2,
            content: {
              blocks: [
                {
                  content: `## Suffering

The Buddha, after years of spiritual searching and contemplation, reached a core insight known as the First Noble Truth: "Life is Suffering." Not in a cynical sense, but in a deeply human one.

Suffering, dukkha, is part of every life, from physical pain to emotional wounds, from longing to loss, from uncertainty to impermanence. The Buddha didn't just theorize this. He observed it, lived it, and understood that until we acknowledge suffering, we can't transcend it.

So we begin here, with honesty and explore your hidden suffering.`,
                },
                {
                  ai: {
                    systemPrompt:
                      'You are a compassionate guide helping someone explore their inner suffering with wisdom and care.',
                    initialUserPrompt:
                      'Knowing what you know about me, what do you think are the sufferings I carry quietly or subconsciously?',
                  },
                },
              ],
            },
          },
          {
            order: 3,
            content: {
              blocks: [
                {
                  content: `## Desires

After reflecting on the answers, inquire further about what you need more of and less of to live your best life.

Ask it slowly - maybe one at a time. Let the response sit with you. You can engage the AI in further inquiry if something feels true, unclear, or revealing. Don't be afraid to press deeper. You may want to journal, meditate, or discuss it with your loved ones, friends or colleagues who can help you inquire further. This is an awareness practice.`,
                },
                {
                  ai: {
                    systemPrompt:
                      'You are a thoughtful guide helping someone understand their deeper needs and desires.',
                    initialUserPrompt: 'What do I need more of and what do I need less of to live my best life?',
                  },
                },
              ],
            },
          },
          {
            order: 4,
            content: {
              blocks: [
                {
                  content: `# Step Two: Ikigai Expanded, Light and Shadow

Before you answer the big question, "What does my Best Life look like?," it helps to think in the Ikigai framework. Ikigai is a Japanese concept of "purpose - a reason for being."

It is often visualized as the intersection of four key areas: What you love, What you are good at, What you can be paid for, and What the world needs. When all four align, it creates a life of fulfillment, contribution, and clarity.

For further inquiry, I always like to look at both sides of the coin, the light and the shadow, because true alignment comes from full awareness.

For each of the four pairs below, I encourage you to ask AI or close friends so that you are not just thinking in an echo chamber alone. Reflect and journal by hand if possible. Let yourself go beyond the obvious. It's a good exercise to do as often as needed.`,
                },
              ],
            },
          },
          {
            order: 5,
            content: {
              blocks: [
                {
                  content: `## 1. Passion / Dislikes

Explore both what energizes you and what drains you:
• What are the things I've always loved doing?
• What activities or tasks consistently drain me or frustrate me?`,
                },
                {
                  ai: {
                    systemPrompt: 'Help the user explore their passions and dislikes with depth and insight.',
                    initialUserPrompt:
                      "What are the things I've always loved doing? And what activities or tasks consistently drain me or frustrate me?",
                  },
                },
              ],
            },
          },
          {
            order: 6,
            content: {
              blocks: [
                {
                  content: `## 2. Competency / Ineptitude

Understand your natural strengths and persistent challenges:
• Where do I naturally excel at and I am so good that I am a league of my own?
• Where do I consistently fall short, struggle, or feel clumsy?`,
                },
                {
                  ai: {
                    systemPrompt: 'Guide the user in recognizing their unique competencies and areas of struggle.',
                    initialUserPrompt:
                      'Where do I naturally excel at and I am so good that I am a league of my own? Where do I consistently fall short, struggle, or feel clumsy?',
                  },
                },
              ],
            },
          },
          {
            order: 7,
            content: {
              blocks: [
                {
                  content: `## 3. $ Success / $ Missed

Reflect on your financial patterns and opportunities:
• Where and how have I successfully made money in the past?
• Where have I missed opportunities or made financial mistakes?`,
                },
                {
                  ai: {
                    systemPrompt:
                      'Help the user examine their financial successes and missed opportunities with clarity.',
                    initialUserPrompt:
                      'Where and how have I successfully made money in the past? Where have I missed opportunities or made financial mistakes?',
                  },
                },
              ],
            },
          },
          {
            order: 8,
            content: {
              blocks: [
                {
                  content: `## 4. Impact / Indifference

Consider where your efforts create meaning:
• What kinds of impact have I made that truly mattered to me?
• What causes or outcomes am I surprisingly indifferent to?`,
                },
                {
                  ai: {
                    systemPrompt:
                      'Guide the user in understanding where they create meaningful impact and what they are indifferent to.',
                    initialUserPrompt:
                      'What kinds of impact have I made that truly mattered to me? What causes or outcomes am I surprisingly indifferent to?',
                  },
                },
              ],
            },
          },
          {
            order: 9,
            content: {
              blocks: [
                {
                  content: `## Synthesis

Please write your thoughts freely first. Then, once you've gathered your raw reflections, synthesize your insights into 1–3 words or a short phrase for each column in the worksheet. When you're ready, bring these insights to the group. Your vulnerability will create space for deeper and more meaningful dialogue.`,
                },
              ],
            },
          },
          {
            order: 10,
            content: {
              blocks: [
                {
                  content: `# Step Three: Best Life

Now, ask yourself: What does my Best Life look like?

Write your Best Life statement in 1–2 sentences. Let it be bold and true, even if it scares you or feels far away. This is the start of your journey, not the final draft.`,
                },
                {
                  ai: {
                    systemPrompt:
                      'You are helping someone articulate their vision of their Best Life based on all their previous reflections.',
                    initialUserPrompt: `Based on everything I've shared so far, can you help me describe my Best Life in a short paragraph? Consider:
- If I fully lived into my passions, competencies, values, and purpose, what would my ideal life feel and look like?
- What would a typical day in my Best Life include?
- What kind of person am I in my Best Life?
- Where am I living, what am I doing, and who am I becoming in my Best Life?`,
                  },
                },
              ],
            },
          },
          {
            order: 11,
            content: {
              blocks: [
                {
                  content: `## Closing Thoughts

I hope this exercise has been helpful for you. Please know that this is an invitation, not an obligation. If anything doesn't feel right for you, don't hesitate to adjust it to your needs.

I also understand that everyone has a different comfort level when it comes to AI tools and privacy. Please use your own judgment and do what feels best for you.

This is simply the beginning of your journey. I sincerely appreciate your trust in this process and look forward to seeing where it takes you.`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Created exercise: ${exercise.name} with ${11} steps`);

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
