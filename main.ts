import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as fs from "fs";
import * as path from "path";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	obsidianFolder: string;
	projectFolder: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	obsidianFolder: 'blog/',
	projectFolder: '/Users/'

}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log("loading plugin");
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new SampleModal(this.app).open();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
		this.addCommand({
			id: 'push-md-command',
			name: 'Push Markdown command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const lines = editor.lineCount()
				let text = "";
				for (let i = 0; i < lines; i++) {
					text += editor.getLine(i) + "\n";
				}
				const { obsidianFolder, projectFolder } = this.settings;

				try {
					fs.writeFileSync(`${projectFolder}${view.file.name}`, text);
					new Notice(`Your file has been created! At ${projectFolder}${view.file.name}`);
				} catch (err) {
					new Notice(err.message);
					console.error(err);
				}
			},
		});

		this.addCommand({
			id: 'pull-md-command',
			name: 'Pull Markdown command',
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				const projectBlogPath = path.resolve(this.settings.projectFolder, view.file.name);
				
				if (fs.existsSync(projectBlogPath)) {
					// do command
					new Notice(path.normalize("./" + view.file.path));
					// fs.writeFileSync(view.file.path)
					return true;
				}

				return false;
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log("unloading plugin");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Obsidian Markdown Blogger.'});

		new Setting(containerEl)
			.setName('Obsidian Blog Folder Path')
			.setDesc('The Obsidian folder you keep your md blog posts in.')
			.addText(text => text
				.setPlaceholder('blog/posts')
				.setValue(this.plugin.settings.obsidianFolder)
				.onChange(async (value) => {
					this.plugin.settings.obsidianFolder = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Actual Blog Folder Path')
			.setDesc('The project folder of your blog. Must be an absolute path.')
			.addText(text => text
				.setPlaceholder('/Users/johnsample/code-projects/astro-blog/collections')
				.setValue(this.plugin.settings.projectFolder)
				.onChange(async (value) => {
					this.plugin.settings.projectFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}
