export default function SplitArray (nums: number[], k: number): number {
    function canSplit(nums: number[], k: number, maxSum: number): boolean {
        let currentSum = 0;
        let subarrays = 1;

        for (const num of nums) {
            if (currentSum + num > maxSum) {
                subarrays++;
                currentSum = num;

                if (subarrays > k) {
                    return false;
                }
            } else {
                currentSum += num;
            }
        }

        return true;
    }

    let low = Math.max(...nums);
    let high = nums.reduce((a, b) => a + b, 0);

    while (low < high) {
        const mid = Math.floor((low + high) / 2);

        if (canSplit(nums, k, mid)) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    return low;
}
