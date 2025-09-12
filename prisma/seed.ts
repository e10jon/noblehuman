import { PrismaClient } from './generated/client.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NobleHuman database...');

  const nobleHumanExercise = await prisma.exercise.create({
    data: {
      name: "Dating Myself: The Most Interesting Person I've Just Met",
      weekNumber: 1,
      buddhismConcept: 'Best Life Foundation',
      metadata: {
        totalSteps: 4,
        estimatedMinutes: 120,
        outcomes: [
          'Develop deep self-awareness through suffering exploration',
          'Identify desires and needs for your best life',
          'Create an Ikigai framework for purpose',
          'Articulate your Best Life vision',
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            type: 'static',
            title: 'Step One: Dating Myself - Suffering',
            description: `I invite you to go on a date with yourself. Not the version of you that shows up in a boardroom, on stage, or at dinner parties, but the quiet, soulful version of you. The one who has been through every moment of your life. The one who has never left your side.

Imagine you just met someone truly fascinating — wise, layered, scarred, accomplished, still learning, still open, still hungry. You want to know everything about them. Their triumphs, their regrets, their deepest needs and quietest joys. That person is you.

Approach this exercise with tenderness, curiosity, and radical self-respect. This is not about fixing you. This is about witnessing you. Knowing yourself with the same compassion you would offer someone you deeply admire.

## Suffering

The Buddha, after years of spiritual searching and contemplation, reached a core insight known as the First Noble Truth: "Life is Suffering." Not in a cynical sense, but in a deeply human one.

Suffering, dukkha, is part of every life, from physical pain to emotional wounds, from longing to loss, from uncertainty to impermanence. The Buddha didn't just theorize this. He observed it, lived it, and understood that until we acknowledge suffering, we can't transcend it.

So we begin here, with honesty and explore your hidden suffering.`,
            conversationConfig: {
              initialPrompt:
                'Knowing what you know about me, what do you think are the sufferings I carry quietly or subconsciously?',
            },
            responseType: 'multiPrompt',
            groupSharing: false,
          },
          {
            order: 2,
            type: 'aiPrompt',
            title: 'Step One: Dating Myself - Desires',
            description: `## Desires

After reflecting on the answers about your suffering, let's inquire further about what you truly need.

Ask slowly - maybe one at a time. Let the response sit with you. You can engage the AI in further inquiry if something feels true, unclear, or revealing. Don't be afraid to press deeper. You may want to journal, meditate, or discuss it with your loved ones, friends or colleagues who can help you inquire further. This is an awareness practice.`,
            conversationConfig: {
              initialPrompt: 'What do I need more of to live my best life? What do I need less of?',
            },
            responseType: 'multiPrompt',
            groupSharing: false,
          },
          {
            order: 3,
            type: 'static',
            title: 'Step Two: Ikigai Expanded, Light and Shadow',
            description: `Before you answer the big question, "What does my Best Life look like?," it helps to think in the Ikigai framework. Ikigai is a Japanese concept of "purpose - a reason for being." It is often visualized as the intersection of four key areas: What you love, What you are good at, What you can be paid for, and What the world needs. When all four align, it creates a life of fulfillment, contribution, and clarity.

For further inquiry, I always like to look at both sides of the coin, the light and the shadow, because true alignment comes from full awareness.

For each of the four pairs below, I encourage you to ask AI or close friends so that you are not just thinking in an echo chamber alone. Reflect and journal by hand if possible. Let yourself go beyond the obvious. It's a good exercise to do as often as needed.

Please write your thoughts freely first. Then, once you've gathered your raw reflections, synthesize your insights into 1–3 words or a short phrase for each column.`,
            responseType: 'ikigaiGrid',
            groupSharing: true,
          },
          {
            order: 4,
            type: 'aiPrompt',
            title: 'Step Three: Best Life',
            description: `Now, ask yourself: What does my Best Life look like?

Write your Best Life statement in 1–2 sentences. Let it be bold and true, even if it scares you or feels far away. This is the start of your journey, not the final draft.`,
            conversationConfig: {
              initialPrompt:
                "Based on everything I've shared so far, can you help me describe my Best Life? If I fully lived into my passions, competencies, values, and purpose, what would my ideal life feel and look like? What would a typical day include? What kind of person am I? Where am I living, what am I doing, and who am I becoming?",
            },
            responseType: 'statement',
            groupSharing: true,
          },
        ],
      },
    },
    include: {
      steps: true,
    },
  });

  console.log(`Created exercise: ${nobleHumanExercise.name} with ${nobleHumanExercise.steps.length} steps`);

  const week2Exercise = await prisma.exercise.create({
    data: {
      name: 'Noble Truth One: All Humans Suffer (Dukkha)',
      weekNumber: 2,
      buddhismConcept: 'Dukkha - The Truth of Suffering',
      metadata: {
        totalSteps: 4,
        estimatedMinutes: 180,
        outcomes: [
          'Understand your Family DNA Karma',
          'Identify inherited patterns and traits',
          'Explore childhood influences on current suffering',
          'Discover what you need most for your best life',
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            type: 'static',
            title: 'Dukkha Reflection Questions',
            description: `Complete the six sections of reflection questions to explore your suffering and its origins.`,
            questionSet: {
              title: '30 Dukkha Reflection Questions',
              description: 'Deep exploration of identity, inheritance, and suffering',
              questions: [
                {
                  id: 'q1',
                  section: 'Opening Reflections – Identity and Inheritance',
                  number: 1,
                  question:
                    'Out of your mother(s)/mother figure(s) and father(s)/father figure(s), whom do you most resemble in appearance and personality? What are their names and current ages?',
                  type: 'multiline',
                },
                {
                  id: 'q2',
                  section: 'Opening Reflections – Identity and Inheritance',
                  number: 2,
                  question: 'What do you love about their physical or personality traits you inherited from them?',
                  type: 'multiline',
                },
                {
                  id: 'q3',
                  section: 'Opening Reflections – Identity and Inheritance',
                  number: 3,
                  question: 'What do you find challenging about the traits you inherited?',
                  type: 'multiline',
                },
                {
                  id: 'q4',
                  section: 'Opening Reflections – Identity and Inheritance',
                  number: 4,
                  question: 'How have those traits shaped the way you show up in the world?',
                  type: 'multiline',
                },
                {
                  id: 'q5',
                  section: 'Opening Reflections – Identity and Inheritance',
                  number: 5,
                  question: 'How do others see you, and how is that different from how you see yourself?',
                  type: 'multiline',
                },
              ],
            },
            responseType: 'questionnaire',
            groupSharing: false,
          },
          {
            order: 2,
            type: 'static',
            title: 'Family Patterns Analysis',
            description: `Synthesize what you've uncovered about your family patterns and identify your positive and negative drivers.`,
            instructionSections: [
              {
                id: 'family-resemblance',
                title: 'Family Resemblance',
                content:
                  'Share whom you most resemble from your family (mother, father, grandparents), physically, then in personality traits.',
                order: 1,
              },
              {
                id: 'drivers',
                title: 'Positive and Negative Drivers',
                content: 'Identify your positive and negative drivers, and reflect on where they originated.',
                order: 2,
              },
            ],
            responseType: 'text',
            groupSharing: true,
          },
          {
            order: 3,
            type: 'aiPrompt',
            title: 'Personal Dukkha Narrative',
            description: `Write a short narrative (1–2 paragraphs) that expresses your personal Dukkha, the deep patterns, beliefs, or emotional burdens that have quietly shaped your life.`,
            conversationConfig: {
              initialPrompt:
                'What negative drivers have fueled your success but are no longer serving you? What emotional wounds or inherited patterns have held you back from living your best, most authentic life filled with joy? Where have you sacrificed peace, freedom, or joy in pursuit of achievement or approval?',
            },
            responseType: 'narrative',
            groupSharing: true,
          },
          {
            order: 4,
            type: 'static',
            title: 'Most Important Feeling',
            description: `Share Question 30 and why: What is the most important feeling (freedom, peace, joy, safety, etc) that you personally need to live your best life for yourself, before your family, children, or anyone else?`,
            conversationConfig: {
              initialPrompt:
                'What is the most important feeling you need to live your best life? Choose from: freedom, peace, joy, safety, or another feeling that resonates.',
            },
            responseType: 'shortPhrase',
            groupSharing: true,
          },
        ],
      },
    },
  });

  console.log(`Created exercise: ${week2Exercise.name}`);

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
