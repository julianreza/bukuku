export function BinerString(strs: string[], m: number, n: number): number {
    const dp: number[][][] = new Array(strs.length + 1);
    for (let i = 0; i <= strs.length; i++) {
        dp[i] = new Array(m + 1);
        for (let j = 0; j <= m; j++) {
            dp[i][j] = new Array(n + 1).fill(0);
        }
    }
    
    for (let i = 1; i <= strs.length; i++) {
        const zeroCount = countZeroes(strs[i - 1]);
        const oneCount = strs[i - 1].length - zeroCount;
        
        for (let j = 0; j <= m; j++) {
            for (let k = 0; k <= n; k++) {
                if (j >= zeroCount && k >= oneCount) {
                    dp[i][j][k] = Math.max(dp[i-1][j][k], dp[i-1][j-zeroCount][k-oneCount] + 1);
                } else {
                    dp[i][j][k] = dp[i-1][j][k];
                }
            }
        }
    }
    
    return dp[strs.length][m][n];
}

function countZeroes(str: string): number {
    let count = 0;
    for (let char of str) {
        if (char === '0') {
            count++;
        }
    }
    return count;
}