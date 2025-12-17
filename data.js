// 1. 3Sum Closest
// 2. 4Sum
// 3. Remove Duplicates from Sorted Array II
// 4. Rotate Image
    

const threeSumClosest = (nums, target) => {
    let closest = Infinity;
    nums.sort((a, b) => a - b);
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let left = i + 1;
        let right = nums.length - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === target) {
                return sum;
            }
            if (Math.abs(sum - target) < Math.abs(closest - target)) {
                closest = sum;
            }
            if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    return closest;
}

console.log('3Sum Closest:', threeSumClosest([-1, 2, 1, -4], 1)); // Output: 2


const fourSum = (nums, target) => {
    const result = [];
    nums.sort((a, b) => a - b);
    for (let i = 0; i < nums.length - 3; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        for (let j = i + 1; j < nums.length - 2; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            let left = j + 1;
            let right = nums.length - 1;
            while (left < right) {
                const sum = nums[i] + nums[j] + nums[left] + nums[right];
                if (sum === target) {
                    result.push([nums[i], nums[j], nums[left], nums[right]]);
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    while (left < right && nums[right] === nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    return result;
}

console.log('4Sum:', fourSum([1, 0, -1, 0, -2, 2], 0)); // Output: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]


const removeDuplicates = (nums) => {
    if (nums.length <= 2) return nums.length;
    let i = 1; // Start from index 1, allow at most 2 occurrences
    for (let j = 2; j < nums.length; j++) {
        if (nums[j] !== nums[i - 1]) {
            i++;
            nums[i] = nums[j];
        }
    }
    return i + 1;
}

console.log('Remove Duplicates II:', removeDuplicates([1, 1, 1, 2, 2, 3])); // Output: 5


const rotateImage = (matrix) => {
    const n = matrix.length;
    // Step 1: Transpose the matrix
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    // Step 2: Reverse each row
    for (let i = 0; i < n; i++) {
        matrix[i].reverse();
    }
    return matrix;
}

console.log('Rotate Image:', rotateImage([[1, 2, 3], [4, 5, 6], [7, 8, 9]])); // Output: [[7, 4, 1], [8, 5, 2], [9, 6, 3]]