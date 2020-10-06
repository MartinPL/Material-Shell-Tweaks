const { Clutter, Meta } = imports.gi;
const Main = imports.ui.main;
const ExtensionManager = Main.extensionManager;
const materialShell = ExtensionManager.lookup('material-shell@papyelgringo');
const { TileableItem } = materialShell.imports.src.widget.taskBar;
const { MsWorkspaceActor } = materialShell.imports.src.layout.msWorkspace.msWorkspace; 

function enable() {
	fixedTaskbarItem();
	topBarScroll();

	Main.panel._oldChangeMenu = Main.panel.menuManager._changeMenu;
	Main.panel.menuManager._changeMenu = () => {};
}

function fixedTaskbarItem() {
	TileableItem.prototype.setStyle = function() {
		if(!this.title.natural_width) {
			this.title.natural_width = 160;
			this.title.natural_width_set = 1;
		}
		this.updateTitle();

		if (this.style == 'icon') {
			this.title.hide();
		} else {
			this.title.show();
		}
	}
}

function topBarScroll() { 
	MsWorkspaceActor.prototype.updateUI = function () { 
		const monitorInFullScreen = global.display.get_monitor_in_fullscreen(this.msWorkspace.monitor.index);
		if (this.panel) {
			this.panel.visible = this.msWorkspace.shouldPanelBeVisible() && !monitorInFullScreen;
		}
		this.tileableContainer.visible = !this.msWorkspace.containFullscreenWindow && !monitorInFullScreen;

		if(!this.lastScroll) { 
			this.panel.reactive = true; 
			this.lastScroll = Date.now();
			this.panel.connect('scroll-event', (actor, event) => { 
				const currentTime = Date.now();
				if (currentTime < this.lastScroll + 200) {
					if (currentTime < this.lastScroll) {
						this.lastScroll = 0;
					} else {
						return Clutter.EVENT_STOP;
					}
				}
		
				let motion;
				switch (event.get_scroll_direction()) {
					case Clutter.ScrollDirection.UP:        motion = Meta.MotionDirection.UP;       break;
					case Clutter.ScrollDirection.DOWN:      motion = Meta.MotionDirection.DOWN;     break;
				}
		
				const ws = global.workspaceManager.get_active_workspace().get_neighbor(motion);
				Main.wm.actionMoveWorkspace(ws);
				this.lastScroll = currentTime;
				return Clutter.EVENT_STOP;
			});
		}
	}
}

function disable() {
	Main.panel.menuManager._changeMenu = Main.panel._oldChangeMenu;
}