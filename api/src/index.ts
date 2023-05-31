import { HandleRequest, HttpRequest, HttpResponse} from "@fermyon/spin-sdk"

const decoder = new TextDecoder()
const encoder = new TextEncoder()

function calculateExpression(input: string): number {
  const sanitizedInput = input.replace(/\s/g, ''); // Remove any whitespace from the input
  const operators = ['+', '-', '*', '/']; // List of supported operators
  const numberStack: number[] = []; // Stack to hold numbers
  const operatorStack: string[] = []; // Stack to hold operators

  // Helper function to perform arithmetic operations
  const performOperation = () => {
    const operator = operatorStack.pop();
    const operand2 = numberStack.pop();
    const operand1 = numberStack.pop();

    if (operand1 === undefined || operand2 === undefined) {
      throw new Error('Invalid expression');
    }

    let result: number;

    switch (operator) {
      case '+':
        result = operand1 + operand2;
        break;
      case '-':
        result = operand1 - operand2;
        break;
      case '*':
        result = operand1 * operand2;
        break;
      case '/':
        result = operand1 / operand2;
        break;
      default:
        throw new Error('Invalid operator');
    }

    numberStack.push(result);
  };

  // Iterate through each character in the input
  for (let i = 0; i < sanitizedInput.length; i++) {
    const char = sanitizedInput[i];

    if (!isNaN(Number(char))) {
      // If the character is a number, continue reading the subsequent characters until a non-digit is encountered
      let numberString = char;

      while (i + 1 < sanitizedInput.length && !isNaN(Number(sanitizedInput[i + 1]))) {
        numberString += sanitizedInput[i + 1];
        i++;
      }

      numberStack.push(Number(numberString));
    } else if (operators.includes(char)) {
      // If the character is an operator, check the operator stack to determine if any pending operations should be performed
      while (
        operatorStack.length > 0 &&
        operators.includes(operatorStack[operatorStack.length - 1])
      ) {
        performOperation();
      }

      operatorStack.push(char);
    } else {
      // If the character is not a number or an operator, throw an error
      throw new Error('Invalid character');
    }
  }

  // Perform any remaining operations
  while (operatorStack.length > 0) {
    performOperation();
  }

  // Return the final result
  if (numberStack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return numberStack[0];
}

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {
    const result = calculateExpression(decoder.decode(request.body))
    console.log("Request: " + decoder.decode(request.body))
    console.log("Result: " + result)
    return {
      status: 200,
      body: encoder.encode(result.toString()).buffer
    }
}
