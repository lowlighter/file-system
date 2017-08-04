/**
 * Display entry's properties in a new window.
 * @param {Entry} entry - Entry
 */
    gui_properties(entry) { try {
        //Basic properties
            let table = $(`<table>
                <tr><td>${GUI.TEXT.NAME}</td><td>${entry.name}</td></tr>
                <tr><td>${GUI.TEXT.PARENT}</td><td>${entry.parent.name}</td></tr>
                <tr><td>${GUI.TEXT.BLOCK}</td><td>${entry.block.id}</td></tr>
                <tr><td>${GUI.TEXT.SIZE}</td><td>${entry.file ? Interface.bytes_format(entry.blocks.length * this.image.block_size) : "-"}</td></tr>
                <tr><td>${GUI.TEXT.TYPE}</td><td>${entry.file ? GUI.TEXT.FILE : GUI.TEXT.FOLDER }</td></tr>
                <tr><td>${GUI.TEXT.VISIBILITY}</td><td>${entry.visible ? GUI.TEXT.VISIBLE : GUI.TEXT.HIDDEN}</td></tr>
                <tr><td>${GUI.TEXT.OWNER}</td><td>${this.users_list[entry.owner]}</td></tr>
            </table>`)

        //Extended properties
            if (this.image.table_extended) {
                let creation = entry.creation, edition = entry.edition, permissions = entry.permissions
                table.append(`
                    <tr><td>${GUI.TEXT.CREATION}</td><td>${`${creation.d}/${creation.m}/${creation.y}, ${creation.h}:${creation.m}:${creation.s}`}</td></tr>
                    <tr><td>${GUI.TEXT.EDITION}</td><td>${`${edition.d}/${edition.m}/${edition.y}, ${edition.h}:${edition.m}:${edition.s}`}</td></tr>
                    <tr><td colspan="2"><table class="app-entry-properties-permissions">
                        <tr><th>${GUI.TEXT.PERMISSIONS}</th><th>${GUI.TEXT.PERMISSIONS_OWNER}</th><th>${GUI.TEXT.PERMISSIONS_OTHERS}</th></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_R}</td>
                            <td>${permissions.u.r ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.r ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_W}</td>
                            <td>${permissions.u.w ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.w ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_X}</td>
                            <td>${permissions.u.x ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.x ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_D}</td>
                            <td>${permissions.u.d ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.d ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                    </table></td></tr>`)
            }
            //Create properties window
                this.gui_window(GUI.TEXT.PROPERTIES).addClass("app-entry-properties").find(".app-windows-content").append(table)
        } catch (e) { throw e; this.gui_error(e) }
    }

/**
 * Display image properties.
 */
    gui_config() {
        //Icon
            let config = this._gui_icon("config", GUI.TEXT.CONFIG).attr("data-app-icon", "dstat").appendTo(this.context)

        //Create properties window
            config.click(() => { try {
                if ($(".app-disk-properties").length) { return }
                let table = $(`<table>
                    <tr><td>${GUI.TEXT.CONFIG_SIGNATURE}</td>
                        <td>${this.image.signature}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_CRYPTED}</td>
                        <td>${this.image.crypted ? GUI.TEXT.CONFIG_Y : GUI.TEXT.CONFIG_N}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_SIZE}</td>
                        <td>${Interface.bytes_format(this.image.size)}</td></tr>
                </table>`)

                //Append window
                    this.gui_window(GUI.TEXT.PROPERTIES).addClass("app-disk-properties").find(".app-windows-content").append(table)

                if (!this.image.crypted) {
                    $(`<tr><td>${GUI.TEXT.CONFIG_USED}</td>
                        <td>${Interface.bytes_format(this.image.size - this.image.free)}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_FREE}</td>
                        <td>${Interface.bytes_format(this.image.free)}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_WIDTH}</td>
                        <td>${this.image.width}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_HEIGHT}</td>
                        <td>${this.image.height}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_TABLE_SIZE}</td>
                        <td>${this.image.table_size}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_TABLE_EXTENDED}</td>
                        <td>${this.image.table_extended ? GUI.TEXT.CONFIG_Y : GUI.TEXT.CONFIG_N}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_ENTRY_NAME}</td>
                        <td>${this.image.entry_name}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_BLOCK_SIZE}</td>
                        <td>${Interface.bytes_format(this.image.block_size)}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_BLOCK_NUMBER}</td>
                        <td>${this.image.block_number}</td></tr>`).appendTo(table)
                }
         } catch (e) { this.gui_error(e) } })
    }
