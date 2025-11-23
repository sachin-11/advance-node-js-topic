# 🔧 Git Configuration Guide

## Step 1: Set Your Name and Email

```bash
# Set your name (replace with your actual name)
git config --global user.name "Your Name"

# Set your email (replace with your actual email)
git config --global user.email "rajeshsachi786@gmail.com"
```

## Step 2: Verify Configuration

```bash
# Check your configuration
git config --global user.name
git config --global user.email

# Or see all config
git config --global --list
```

## Step 3: Set Editor (Optional)

```bash
# Set default editor (VS Code example)
git config --global core.editor "code --wait"

# Or use nano
git config --global core.editor "nano"

# Or use vim
git config --global core.editor "vim"
```

## Step 4: Set Default Branch Name

```bash
# Set default branch to 'main' (already done in your case)
git config --global init.defaultBranch main
```

## Step 5: Useful Additional Settings

```bash
# Enable colored output
git config --global color.ui auto

# Set default push behavior
git config --global push.default simple

# Enable credential helper (for GitHub)
git config --global credential.helper osxkeychain
```

## Quick Setup Commands

Run these commands with your actual details:

```bash
git config --global user.name "Sachin"
git config --global user.email "sachin@example.com"
git config --global core.editor "code --wait"
git config --global color.ui auto
```

## Verify Everything

```bash
git config --global --list
```

---

**Note:** Replace "Sachin" and "sachin@example.com" with your actual name and email!

