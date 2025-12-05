# How to Add Your Resume PDF

## Issue
The current `public/resume.pdf` file might be corrupted or not opening properly on Mac Preview.

## Solution: Copy Your Actual Resume

### Step 1: Find Your Resume PDF
Your resume PDF should be in your Downloads folder with a name like:
- `Sachin_Singh_Resume (3).pdf`
- Or any other version

### Step 2: Copy to Portfolio App
Open Terminal and run:

```bash
# Navigate to portfolio app
cd /Users/thejdfilmer/Desktop/sachinfolder/portfolio-app

# Copy your resume (replace with actual filename)
cp ~/Downloads/Sachin_Singh_Resume*.pdf public/resume.pdf

# Or if you know the exact filename:
cp ~/Downloads/"Sachin_Singh_Resume (3).pdf" public/resume.pdf
```

### Step 3: Verify
```bash
# Check if file is valid PDF
file public/resume.pdf

# Should show: "PDF document, version X.X, X pages"
```

### Alternative: Manual Copy
1. Open Finder
2. Go to Downloads folder
3. Find your resume PDF file
4. Copy it (Cmd+C)
5. Go to: `/Users/thejdfilmer/Desktop/sachinfolder/portfolio-app/public/`
6. Paste it and rename to `resume.pdf` (replace existing file)

### After Copying
Restart your dev server:
```bash
npm run dev
```

Then test the download button - it should work properly now!

