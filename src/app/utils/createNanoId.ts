import { customAlphabet } from "nanoid";

const generateNumericNanoid = (length: number = 10): string => {
  const numbersOnlyAlphabet = '0123456789';
  const nanoid = customAlphabet(numbersOnlyAlphabet, length);
  return nanoid();
};

export default generateNumericNanoid;

// Usage example:
// const numericId = generateNumericNanoid(); // Default length 10
// const customLengthNumericId = generateNumericNanoid(15); // Length 15