// Sample questions for the open "Teacher Van" class: 10 per subject, 4 answers each.
// Quiz sets made by teachers have no saved questions yet, so they play the Logic set as a sample.

export type Question = {
  text: string;
  options: [string, string, string, string];
  /** Index of the correct option. */
  answer: number;
  /** Shown after the student answers. */
  why: string;
};

export type Subject = 'Logic' | 'Math' | 'Science' | 'Programming' | 'English';

export const questionBank: Record<Subject, Question[]> = {
  Logic: [
    { text: 'Which gate outputs 1 only when both inputs are 1?', options: ['AND', 'OR', 'XOR', 'NOR'], answer: 0, why: 'AND gives 1 only when every input is 1.' },
    { text: 'Which gate outputs 1 when its two inputs are different?', options: ['OR', 'AND', 'XOR', 'NAND'], answer: 2, why: 'XOR gives 1 only when exactly one input is 1.' },
    { text: 'What does a NOT gate output when its input is 1?', options: ['1', '0', '10', 'It depends'], answer: 1, why: 'A NOT gate flips its input, so 1 becomes 0.' },
    { text: 'Which gate outputs 0 only when both inputs are 1?', options: ['NAND', 'NOR', 'AND', 'XNOR'], answer: 0, why: 'NAND is an AND followed by a NOT.' },
    { text: 'Which two gates are called universal gates?', options: ['AND and OR', 'XOR and XNOR', 'NAND and NOR', 'NOT and AND'], answer: 2, why: 'Any other gate can be built from only NAND gates, or only NOR gates.' },
    { text: 'What is 1 OR 0?', options: ['0', '1', '2', '10'], answer: 1, why: 'OR gives 1 when at least one input is 1.' },
    { text: 'What is 1 AND 0?', options: ['1', '2', '11', '0'], answer: 3, why: 'AND needs every input to be 1, so one 0 makes the output 0.' },
    { text: 'In Boolean algebra, what does A + A equal?', options: ['2A', 'A', '1', '0'], answer: 1, why: 'Idempotent law: A OR A is just A.' },
    { text: 'How many rows does a truth table for 3 inputs have?', options: ['3', '6', '8', '9'], answer: 2, why: 'Each input doubles the rows: 2 × 2 × 2 = 8.' },
    { text: 'By De Morgan’s law, NOT (A AND B) equals…', options: ['NOT A AND NOT B', 'NOT A OR NOT B', 'A OR B', 'A AND B'], answer: 1, why: 'Break the bar and change the operator: AND becomes OR.' },
  ],
  Math: [
    { text: 'What is 12 × 8?', options: ['96', '86', '108', '92'], answer: 0, why: '12 × 8 = 96.' },
    { text: 'What is 15% of 200?', options: ['20', '30', '15', '35'], answer: 1, why: '0.15 × 200 = 30.' },
    { text: 'Solve for x: 3x + 5 = 20', options: ['3', '4', '5', '6'], answer: 2, why: '3x = 15, so x = 5.' },
    { text: 'What is the square root of 144?', options: ['14', '12', '11', '16'], answer: 1, why: '12 × 12 = 144.' },
    { text: 'What is 2 to the power of 5?', options: ['10', '25', '32', '64'], answer: 2, why: '2 × 2 × 2 × 2 × 2 = 32.' },
    { text: 'The angles inside a triangle add up to…', options: ['90°', '180°', '270°', '360°'], answer: 1, why: 'Every triangle’s interior angles sum to 180°.' },
    { text: 'What is 3/4 as a decimal?', options: ['0.34', '0.43', '0.7', '0.75'], answer: 3, why: '3 ÷ 4 = 0.75.' },
    { text: 'What is the area of a 6 by 4 rectangle?', options: ['10', '20', '24', '28'], answer: 2, why: 'Area = length × width = 6 × 4 = 24.' },
    { text: 'Which of these is a prime number?', options: ['8', '9', '10', '11'], answer: 3, why: '11 can only be divided by 1 and itself.' },
    { text: 'What is −3 × −4?', options: ['−12', '12', '−7', '7'], answer: 1, why: 'A negative times a negative is positive.' },
  ],
  Science: [
    { text: 'What is the chemical formula for water?', options: ['H₂O', 'CO₂', 'O₂', 'NaCl'], answer: 0, why: 'Water is two hydrogen atoms and one oxygen atom.' },
    { text: 'Which planet is called the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 2, why: 'Iron oxide (rust) on its surface makes Mars look red.' },
    { text: 'Which gas do plants take in from the air?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], answer: 1, why: 'Plants use carbon dioxide in photosynthesis.' },
    { text: 'What is the unit of electrical resistance?', options: ['Volt', 'Ampere', 'Watt', 'Ohm'], answer: 3, why: 'Resistance is measured in ohms (Ω).' },
    { text: 'What is the center of an atom called?', options: ['Electron', 'Nucleus', 'Orbit', 'Molecule'], answer: 1, why: 'The nucleus holds the protons and neutrons.' },
    { text: 'About how fast does light travel?', options: ['300,000 km/s', '30,000 km/s', '3,000 km/s', '300 km/s'], answer: 0, why: 'Light travels about 300,000 km every second.' },
    { text: 'Which organ pumps blood around the body?', options: ['Lungs', 'Liver', 'Heart', 'Kidney'], answer: 2, why: 'The heart is a muscle that pumps blood.' },
    { text: 'At sea level, water boils at…', options: ['50 °C', '90 °C', '100 °C', '120 °C'], answer: 2, why: 'Water boils at 100 °C at normal air pressure.' },
    { text: 'Which force pulls objects toward Earth?', options: ['Magnetism', 'Friction', 'Inertia', 'Gravity'], answer: 3, why: 'Gravity attracts masses toward each other.' },
    { text: 'Ohm’s law says voltage V equals…', options: ['I × R', 'I ÷ R', 'R ÷ I', 'I + R'], answer: 0, why: 'V = I × R: current times resistance.' },
  ],
  Programming: [
    { text: 'Which data type holds true or false?', options: ['String', 'Integer', 'Boolean', 'Float'], answer: 2, why: 'A Boolean has only two values: true and false.' },
    { text: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'Hyperlink Text Machine Language', 'Home Tool Markup Language'], answer: 0, why: 'HTML is the markup language for web pages.' },
    { text: 'In most languages, what is the index of the first item in an array?', options: ['1', '0', '−1', 'It varies'], answer: 1, why: 'Most languages count array positions from 0.' },
    { text: 'Which symbol starts a comment in Python?', options: ['//', '#', '/*', '--'], answer: 1, why: 'Python comments start with #.' },
    { text: 'What does a loop do?', options: ['Stores data', 'Ends the program', 'Repeats code', 'Names a variable'], answer: 2, why: 'A loop runs the same block of code again and again.' },
    { text: 'What is the result of 7 % 3?', options: ['1', '2', '3', '0'], answer: 0, why: '% gives the remainder: 7 ÷ 3 is 2 remainder 1.' },
    { text: 'Which of these is NOT a programming language?', options: ['Python', 'Java', 'HTTP', 'C++'], answer: 2, why: 'HTTP is a protocol for sending web pages, not a language.' },
    { text: 'In programming, what is a bug?', options: ['A fast program', 'An error in code', 'A type of loop', 'A new feature'], answer: 1, why: 'A bug is a mistake that makes code behave wrongly.' },
    { text: 'What does CPU stand for?', options: ['Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit', 'Central Processing Unit'], answer: 3, why: 'The CPU is the Central Processing Unit.' },
    { text: 'Which keyword makes a decision in code?', options: ['for', 'print', 'if', 'return'], answer: 2, why: '`if` runs code only when a condition is true.' },
  ],
  English: [
    { text: 'Which word is a noun?', options: ['Run', 'Happy', 'Table', 'Quickly'], answer: 2, why: 'A noun names a person, place or thing.' },
    { text: 'What is the past tense of “go”?', options: ['Goed', 'Went', 'Gone', 'Going'], answer: 1, why: '“Go” is irregular: go, went, gone.' },
    { text: 'What is the plural of “child”?', options: ['Childs', 'Childes', 'Children', 'Childrens'], answer: 2, why: '“Child” has an irregular plural: children.' },
    { text: 'Which word means the same as “big”?', options: ['Tiny', 'Large', 'Thin', 'Short'], answer: 1, why: '“Large” is a synonym of “big”.' },
    { text: 'Which word is the opposite of “ancient”?', options: ['Old', 'Historic', 'Aged', 'Modern'], answer: 3, why: '“Modern” is an antonym of “ancient”.' },
    { text: 'Which sentence is correct?', options: ['She don’t like apples.', 'She doesn’t like apples.', 'She not like apples.', 'She doesn’t likes apples.'], answer: 1, why: 'Use “doesn’t” with she, and the base verb “like”.' },
    { text: 'Which word is an adverb?', options: ['Beautiful', 'Carefully', 'Happiness', 'Table'], answer: 1, why: 'Adverbs describe how something is done, often ending in -ly.' },
    { text: 'Pick the right article: “___ apple a day.”', options: ['A', 'An', 'The', 'No article'], answer: 1, why: 'Use “an” before a vowel sound.' },
    { text: 'Which is a complete sentence?', options: ['Running fast.', 'The dog barked.', 'Under the table.', 'Because I said.'], answer: 1, why: 'A complete sentence has a subject and a verb: “The dog barked.”' },
    { text: 'Which word means “they are”?', options: ['Their', 'There', 'They’re', 'Thier'], answer: 2, why: '“They’re” is the short form of “they are”.' },
  ],
};

export const SAMPLE_SUBJECT: Subject = 'Logic';

export function questionsFor(bank: string | null | undefined): Question[] {
  return bank && bank in questionBank ? questionBank[bank as Subject] : questionBank[SAMPLE_SUBJECT];
}
