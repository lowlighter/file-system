/**
 * Create an graphic user interface to handle Image disks.
 * @param {Image} image - Used image disk
 * @param {DOMElement} context - Context
 * @param {Boolean} [init=false] - Initialize image with default files
 * @category interfaces
 */
    constructor(image, context, init) {
        super(image, context, init)
        //Context menu removal
            this.context.click(() => this.context.find(".context").remove()).contextmenu((ev) => ev.preventDefault())
        //Show desktop and open explorer
            this.gui_desktop()
            this.gui_list("/")
            this._gui_window_dragging()
    }

/**
 * Display Graphic User Interface desktop.
 */
    gui_desktop() {
        this._gui_icon("explorer", GUI.TEXT.EXPLORER).appendTo(this.context).click(() => this.gui_list("/"))
        this.gui_cmd()
        this.context.append("<br />")
        this.gui_sessions()
        this.gui_config()
        this.context.append("<br />")
        this.gui_image_manager()
        this.gui_image_steganography()
        this.context.append("<br />")
        this.gui_encrypt()

        this.context.contextmenu((ev) => {
            if ((ev.target.isSameNode($(this.context).get(0)))&&(!$(".app-terminal .app-clippy").length)) {
                $(`<div class="app-clippy context"><div>${GUI.TEXT.CLIPPY}</div></div>`).hide().appendTo(this.context).fadeIn("fast")
            }
        })
    }
