/**
 * Open a new window which can display content.
 * @param {String} [title=""] - Window title
 * @param {Boolean} [content=false] - If enabled, returns content instead of window
 * @return {jQueryCollection} Created window (or window content)
 */
    gui_window(title = "", content = false) {
        //Windows structure
            let offset = {top:parseInt($(".app-terminal .app-windows:last-of-type").css("top"))||GUI.OFFSET.TOP.MIN, left:parseInt($(".app-terminal .app-windows:last-of-type").css("left"))||GUI.OFFSET.LEFT.MIN}
            let context = $(`
                <div class="app-windows">
                    <div class="app-windows-bar">
                        <div class="app-windows-title">${title}</div>
                        <div class="app-windows-close">X</div>
                    </div>
                    <div class="app-windows-content">
                    </div>
                </div>`).appendTo(this.context)
        //New window offset
            offset = {
                top:Math.max(0, Math.min(offset.top + GUI.OFFSET.TOP.VAL, GUI.HEIGHT-context.height()-5)),
                left:Math.max(0, Math.min(offset.left + GUI.OFFSET.LEFT.VAL, GUI.WIDTH-context.width()-5))
            }
            context.css("left", offset.left).css("top", offset.top).click(() => { $(".app-windows").removeClass("active"); context.addClass("active") }).addClass("active")
        //Add draggable attribute
            context.find(".app-windows-bar").mousedown((ev) => GUI.DRAGGING = {x:ev.pageX, y:ev.pageY, context})

        //Close event
            context.find(".app-windows-close").click(() => context.remove())
            return content ? context.find(".app-windows-content") : context
    }

/**
 * Init GUI windows dragging.
 */
    _gui_window_dragging() {
        $(".app-terminal").mouseup(() => GUI.DRAGGING = false)
            .mousemove(ev => this._gui_window_dragged(ev))
    }

/**
 * Callback when a gui window is dragged.
 * @param {Event} ev - Event data
 */
    _gui_window_dragged (ev) {
        if (GUI.DRAGGING) {
            let dragging =  GUI.DRAGGING, context = dragging.context
            let local = {x:parseInt(context.css("left")) + ev.pageX-dragging.x, y:parseInt(context.css("top")) + ev.pageY-dragging.y}
            GUI.DRAGGING = {x:ev.pageX, y:ev.pageY, context}
            context.css("left", Math.max(0, Math.min(local.x,  GUI.WIDTH-context.width()-5))).css("top", Math.max(0, Math.min(local.y, GUI.HEIGHT-context.height()-5)))
        }
    }

/**
 * Display an error message.
 * @param {Error} e - Error
 */
    gui_error(e) {
        this.gui_window(e.name).addClass("app-windows-error").find(".app-windows-content").append(`<table><tr><td><img src="/src/file-system/gui/error.png" /></td><td>${e.message}</td></tr></table>`)
    }

/**
 * Display an alert text.
 * @param {String} title - Title
 * @param {String} text - Text
 * @param {Function} callback - Callback called when button is called
 */
    gui_alert(title, text, callback) {
        //Show alert
            let content = this.gui_window(title).addClass("app-input").find(".app-windows-content")
            content.append(`<table>
                <tr><td class="app-alert-msg">${text}</td></tr>
                <tr><td><button>${GUI.TEXT.VALIDATE}</button></td></tr>
            </table>`)
        //Link callback
            if (callback) { content.find("button").click(() => { callback() }) } else { content.find("button").click(() => { content.parent().remove() }) }
            return content
    }
