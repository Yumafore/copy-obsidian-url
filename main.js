const { Plugin, Notice, TFile } = require('obsidian');

class CopyObsidianUrlPlugin extends Plugin {
  async onload() {
    // 1. 命令面板
    this.addCommand({
      id: 'copy-as-obsidian-link',
      name: '复制为 Obsidian 链接 [标题](url)',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== 'md') return false;
        if (!checking) this.copyLink(file);
        return true;
      },
    });

    // 2. 文件列表 / 标签页右键菜单
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem((item) => {
            item
              .setTitle('复制为 Obsidian 链接')
              .setIcon('link')
              .onClick(() => this.copyLink(file));
          });
        }
      })
    );

    // 3. 编辑器内右键菜单
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor, view) => {
        const file = view.file;
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem((item) => {
            item
              .setTitle('复制为 Obsidian 链接')
              .setIcon('link')
              .onClick(() => this.copyLink(file));
          });
        }
      })
    );
  }

  async copyLink(file) {
    const vaultName = this.app.vault.getName();
    // 去掉 .md 后缀（Obsidian URL 的 file 参数不需要扩展名）
    const filePath = file.path.replace(/\.md$/i, '');
    const title = file.basename;

    const url = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(filePath)}`;
    const markdown = `[${title}](${url})`;

    try {
      await navigator.clipboard.writeText(markdown);
      new Notice('已复制 Obsidian 链接');
    } catch (e) {
      // 兼容旧环境
      const ta = document.createElement('textarea');
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      new Notice('已复制 Obsidian 链接');
    }
  }
}

module.exports = CopyObsidianUrlPlugin;