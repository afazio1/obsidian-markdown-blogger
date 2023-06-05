import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as fs from "fs";
import * as path from "path";

interface MarkdownBloggerSettings {
	projectFolder: string;
}

const DEFAULT_SETTINGS: MarkdownBloggerSettings = {
	projectFolder: ''

}

export default class MarkdownBlogger extends Plugin {
	settings: MarkdownBloggerSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'validate-path-command',
			name: 'Validate Path command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				
				const { projectFolder } = this.settings;
				if (!fs.existsSync(projectFolder)) {
					new ErrorModal(this.app).open();
					return;
				}
				new Notice(`Valid path: ${this.settings.projectFolder}`);
			},
		});

		this.addCommand({
			id: 'push-md-command',
			name: 'Push Markdown command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				
				const { projectFolder } = this.settings;
				if (!fs.existsSync(projectFolder)) {
					new ErrorModal(this.app).open();
					return;
				}
				const text = editor.getDoc().getValue();
				const projectBlogPath = path.resolve(this.settings.projectFolder, view.file.name);
				try {
					fs.writeFileSync(`${projectBlogPath}`, text, {encoding: 'utf8'});
					new Notice(`Your file has been pushed! At ${projectBlogPath}`);
				} catch (err) {
					new Notice(err.message);
				}
			},
		});

		this.addCommand({
			id: 'pull-md-command',
			name: 'Pull Markdown command',
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				const projectBlogPath = path.resolve(this.settings.projectFolder, view.file.name);
				
				if (fs.existsSync(projectBlogPath)) {
					if (!checking) {
						try {
							const file = fs.readFileSync(projectBlogPath, 'utf8');
							editor.getDoc().setValue(file);
						} catch (err) {
							new Notice(err.message);
						}
					}
					return true;
				}
				return false;
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MarkdownBloggerSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ErrorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText("The project folder does not exist. Please create the path or update the current path in Plugin Settings.");
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class MarkdownBloggerSettingTab extends PluginSettingTab {
	plugin: MarkdownBlogger;

	constructor(app: App, plugin: MarkdownBlogger) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Obsidian Markdown Blogger.'});

		new Setting(containerEl)
			.setName('Local Project Folder Path')
			.setDesc('The local project folder for your blog, portfolio, or static site. Must be an absolute path.')
			.addText(text => text
				.setPlaceholder('/Users/johnsample/code-projects/astro-blog/collections/')
				.setValue(this.plugin.settings.projectFolder)
				.onChange(async (value) => {
					this.plugin.settings.projectFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}
