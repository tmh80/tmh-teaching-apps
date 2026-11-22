# Proposal: how an animal moves (hopping and climbing), and lower small animals

Written 23 Nov 2026 for Tom, from his note: "rodents might need to be lower to the ground (armadillo, rabbit). One locomotion option should be a hop or a chimp-like climb or swing. The hop would make back legs bigger like a rabbit. Tree swinging would get it out of the way of predators and find new food. Think about how it fits completely before adding it in."

Nothing here is built yet. It waits for Tom's answers (section 8).

## 1. The idea in one paragraph

A new trait in the designer's **Moving** tab: **"How it gets around on land"**, with three choices: **Walks and runs** (today's animals), **Hops** and **Climbs trees**. Each choice changes the body (bigger back legs for hoppers, longer arms and a gripping tail for climbers), how it moves in the scene, and the survival bars. Neither is simply better: each helps in some biomes and hurts in others. That makes it a strong example of the plan's key lesson that an adaptation that helps in one place can hurt in another (plan 5.4).

## 2. The science (true in nature, and what students can discover)

| | Hops | Climbs trees |
|---|---|---|
| Real animals | rabbits, hares, jerboas, kangaroo rats, kangaroos | squirrels, martens, monkeys, baboons, chimpanzees, tree frogs, geckos |
| Body | long, strong back legs; shorter front legs; often a long tail for balance | long front legs or arms, gripping hands and feet, long tail for balance (gripping tail in some monkeys) |
| Helps because | big leaps and sudden zig-zags make it hard for a chasing predator to follow; springy tendons make hopping a cheap way to cross wide open ground | it can escape ground predators by going up; it reaches food others cannot (fruit, nuts, leaves, eggs, insects in bark) |
| Costs | does not work for very big, heavy bodies; not much use for slipping into thick cover | useless where there are no trees; slower on the ground; birds of prey can still reach it in the branches; heavy bodies break branches and fall |
| Best biomes | grassland and desert (open ground, food spread out) | forest first, grassland (acacia trees) a little, freshwater banks a little; almost useless in tundra and desert, impossible in the ocean |

**One honest limit.** Swinging arm over arm (gibbons, orangutans) only happens in tropical rainforest, and Adapt Lab's forest is a temperate forest (oaks, foxes, owls). Chimpanzees mostly walk on their knuckles and climb. So I suggest "Climbs trees" as the trait, with the climbing animation showing a climb up the trunk and, for long-armed climbers, a short swing from branch to branch. A true rainforest biome would be a much bigger addition (new predators, plants, food web, story events); I suggest saving it for later (question 3).

## 3. How it fits the science model

The model change is small. Each rule has a visible cause, a visible effect and one sentence a Grade 6 student can read (plan 5.5 rule).

- **New biome value `trees`** (how much tree cover there is): forest 1, freshwater 0.5, grassland 0.3, desert 0.1, tundra 0.05, ocean 0.
- **Hops**
  - Escaping a chasing predator works better: an extra cut of about 15% ("zig-zagged away in big leaps"), but only if the animal escapes fast.
  - Food bar: +4 in open, dry biomes (grassland, desert): "Hopping is a cheap way to cross open ground."
  - Big bodies cannot hop well: above "Large" size, the moving score drops steadily: "It is too heavy to hop far."
- **Climbs trees**
  - Escaping ground predators (chasers and ambushers) works better in proportion to `trees`: up to about half as many caught in the forest, almost no help in the tundra: "Climbed out of reach."
  - Birds of prey catch it a little more (about 15%): "Eagles and hawks can still reach it in the branches." This is the trade-off students should find.
  - Food bar: up to +10 × `trees`: "It finds fruit, nuts and eggs in the trees."
  - On the ground it is slower (moving score × 0.85), and above "Large" size climbing stops working: "Branches cannot hold its weight."
- Only for animals with legs on land (2 or 4 legs for hopping, 4 legs for climbing). Hidden for fish, snakes, crabs and swimmers.

I will check the numbers with a script before building, so that walking stays the best choice somewhere, hopping wins in open grassland, and climbing wins in the forest unless birds of prey are the main danger.

## 4. Cost, combinations and the game

- **Cost of change:** a body feature (2 points a step). Walks is in the middle: walks–hops and walks–climbs are 1 step each; hops to climbs is 2 steps (4 points).
- **New "works well together" and "clashes" chips** (plan 5.3), each tested like the others:
  - Hops + escapes fast: good. "It zig-zags away in big leaps."
  - Hops + huge body or a heavy shell: clash. "It is too heavy to hop."
  - Climbs + forest: good. "Trees give it food and a safe place."
  - Climbs + tundra or desert: clash. "There are almost no trees here to climb."
  - Climbs + long tail: good. "A long tail helps it balance on branches."
  - Climbs + huge body: clash. "Branches cannot hold its weight."
- **Real organisms** get a value: European rabbit and Arctic hare hop. A red squirrel (forest) is a good new climbing preset, and a desert jerboa would be a good new hopper (question 4).
- **Evolution Lab:** students will see the trade-off in the Run. Climbers in the forest lose fewer animals to foxes and more to owls and hawks. Hoppers in the savanna escape cheetahs more often.
- **Chapter 2 (physical and behavioural adaptations):** this is a perfect example of the two working together. The body (long back legs) and the behaviour (hopping away) go as a pair. It also gives Check questions for the misconception "an adaptation that helps in one place helps everywhere" (move the climber to the tundra).

## 5. The art

- **Hopper:** much bigger thighs and longer back feet, shorter front legs, body tilted nose-down at rest and sitting low on its haunches (this is the rabbit Tom wants). It moves in bounds: both back legs push together, the front feet land first, the back feet land in front of them.
- **Climber:** front legs longer than back legs, hands that curl, a long balancing tail. On the ground it walks with its front end higher. In the scene it runs to the nearest tree, climbs the trunk and sits in the branches. Long-armed climbers do a short swing between branches. The designer stage gets a branch for climbers to hold.
- Every trait must change the picture (plan 4.3), and this one changes the silhouette clearly.

## 6. Lower small animals (Tom's other point, art only)

Rabbits and armadillos stand too tall. In real life, small plant-eaters and diggers (rabbits, porcupines, armadillos, hamsters) sit low with their legs mostly hidden under the body. The fix:
- small, round or long four-legged animals with short or medium legs get shorter visible legs and a body that sits lower and slightly hunched;
- armadillos and porcupines get short, thick digging legs;
- rabbits and hares are fixed mostly by the new hop body (section 5).

This changes only the drawing, not the science model, so it can be done first, whatever the answers below.

## 7. Where it goes in the sessions

- Lower small animals: in the next art session (finishing Session 2).
- Hopping and climbing art: Session 3 (actions and behaviours) already covers movement cycles, so it fits there.
- Model rules, cost, combinations and the designer row: Session 5 (the designer), with tests.
- The climbing action in the scene (climbing a tree, being safe up there): Session 4 (biomes), because it needs trees in every biome scene.

## 8. Questions for Tom

1. Two choices (hops, climbs) plus walking, or only one of them?
2. Is the trade-off right: climbers are safer from foxes but easier for owls and hawks?
3. Swinging: a short swing as part of climbing now, and a rainforest biome later (if ever)? Or skip swinging?
4. New presets: a red squirrel (forest climber) and a jerboa (desert hopper)?
