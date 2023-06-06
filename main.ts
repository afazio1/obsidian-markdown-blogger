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
			id: 'validate-path',
			name: 'Validate path',
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
			id: 'push-md',
			name: 'Push markdown',
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
			id: 'pull-md',
			name: 'Pull markdown',
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
		contentEl.setText("The project folder does not exist. Please create the path or update the current path in plugin settings.");
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
			.setName('Local project folder path')
			.setDesc('The local project folder for your blog, portfolio, or static site. Must be an absolute path.')
			.addText(text => text
				.setPlaceholder('/Users/johnsample/projects/astro-blog/collections/')
				.setValue(this.plugin.settings.projectFolder)
				.onChange(async (value) => {
					this.plugin.settings.projectFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}
