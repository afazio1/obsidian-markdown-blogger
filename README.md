# Markdown Blogger
This plugin for [Obsidian](https://obsidian.md) allows developers to instantly push markdown notes to their local blog, portfolio, or static site project. Works with [Astro.js](https://astro.build), [Next.js](https://nextjs.org), and any other framework configured to render markdown pages. 

![markdown-blogger-demo](/images/md-blogger-demo.gif)

Get the benefits of composing markdown notes in Obsidian without having to manually create files and copy-paste content into your local project. Also makes it much easier to keep these two files in-sync. 

## Features
- **Push** a markdown note to a local project folder (Obsidian -> Project)
- **Pull** content from a local project file to a markdown note (Obsidian <- Project)

## Usage
After enabling the plugin, go to Markdown Blogger's settings.
- Set the **Local Project Folder Path**. Must be an **absolute** path.

### Push Markdown command
Creates or overwrites a file at location `/PROJECT_PATH/<note_name>.md` with the current note's markdown content.
- Open a markdown note in editing mode
- Open the command palette and search "Push Markdown command"
- If the **Local Project Folder Path** is invalid or does not exist, the note will not be pushed

### Pull Markdown command 
Overwrites the current note's markdown content with the file content at location `/PROJECT_PATH/<note_name>.md`
- Open a markdown note in editing mode
- Open the command palette and search "Pull Markdown command"
- If the file at location `/PROJECT_PATH/<note_name>.md` is invalid or does not exist, the content will not be pulled

### Validate Path command
Validates the **Local Project Folder Path** in currently in settings.
- Open the command palette and search "Validate Path command"
- A message indicating the validity of the path will be displayed 

## Tips & Disclaimers
1. This is not a Version Control System like Git. Push and pull commands will overwrite the contents of the file. No history is tracked. I recommend only making changes to one file at any given time and pushing or pulling before editing a file.
2. Triple-check your **Local Project Folder Path**. You can easily copy the **absolute** path from within VS Code by right-clicking the directory where you store your `.md` files. 
	- Ex. `/Users/alexa/Desktop/code-projects/alexa-blog/src/content`
3. Files are paired with each other (in Obsidian vs. in Project) based on their filename. As of now, if you change the filename in one place you must change it in the other. 
4. Since the `.md` file in your project will have the same filename as the Obsidian note it was generated from, I recommend using hyphens instead of spaces when naming files.
	- Ex. `Cool Blog Post.md` becomes `Cool-Blog-Post.md`

## Say Thanks
Hi, I'm Alexa. A developer, college student, and YouTuber.

I build tools and create content because I love connecting with people. If you feel compelled to buy me a coffee that would be greatly appreciated! 🤗

<a href="https://www.buymeacoffee.com/alexafazio" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
