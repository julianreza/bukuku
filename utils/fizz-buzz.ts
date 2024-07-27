export default function FizzBuzz(n: number) {
    if(n < 1) {
        return "Tidak bisa input kurang dari 1"
    }

    if(n > 10000) {
        return "Tidak bisa input lebih dari 10000"
    }

    let result = [];
    
    for (let i = 1; i <= n; i++) {
        if (i % 3 === 0 && i % 5 === 0 && i % 7 === 0) {
            result.push("FizzBuzz");
        } else if (i % 3 === 0 && i % 5 === 0) {
            result.push("Fizz1");
        } else if (i % 3 === 0 && i % 7 === 0) {
            result.push("Fizz2");
        } else if (i % 5 === 0 && i % 7 === 0) {
            result.push("Fizz3");
        } else if (i % 3 === 0) {
            result.push("Buzz1");
        } else if (i % 5 === 0) {
            result.push("Buzz2");
        } else if (i % 7 === 0) {
            result.push("Buzz3");
        } else {
            result.push(i.toString());
        }
    }

    return result.join(', ');
}