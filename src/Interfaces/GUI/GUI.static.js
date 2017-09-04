//Invert direction context once % is reached
    GUI.INVERT_CONTEXT = 0.7
//New contxt offset
    GUI.OFFSET = {}
    GUI.OFFSET.TOP = {VAL:10, MIN:40}
    GUI.OFFSET.LEFT = {VAL:10, MIN:60}

//Dimensions
    Object.defineProperty(GUI, "WIDTH", {get() { return $(".app-controller").width() } })
    Object.defineProperty(GUI, "HEIGHT", {get() { return $(".app-controller").height() } })
    GUI.WINDOW_WIDTH  = 300
    GUI.WINDOW_HEIGHT  = 250

//Set of available commands (used for [Autocompletition]{@link GUI#_gui_cmd_autocomplete}).
    GUI.COMMANDS = ["pwd", "env", "whoami", "users", "dstat", "dload", "encrypt", "decrypt", "adduser", "deluser", "su", "explorer", "terminal", "edit", "play", "display", "exec", "cd", "mkdir", "mkfile", "dformat", "help", "rm", "chown", "stat", "chmod", "mv", "ls", "tree"]


/**
 * Texts
 * @type {Object}
 * @memberof GUI
 */
    GUI.TEXT = {
        MK_NEW_FILE:$(".text-mk-new-file").text(),
        MK_NEW_FOLDER:$(".text-mk-new-folder").text(),
        PROPERTIES:$(".text-properties").text(),
        NAME:$(".text-name").text(),
        PARENT:$(".text-parent").text(),
        BLOCK:$(".text-block").text(),
        SIZE:$(".text-size").text(),
        TYPE:$(".text-type").text(),
        FILE:$(".text-type-file").text(),
        FOLDER:$(".text-type-folder").text(),
        VISIBILITY:$(".text-visibility").text(),
        VISIBLE:$(".text-visibility-visible").text(),
        HIDDEN:$(".text-visibility-hidden").text(),
        OWNER:$(".text-owner").text(),
        CREATION:$(".text-date-creation").text(),
        EDITION:$(".text-date-edition").text(),
        PERMISSIONS:$(".text-permissions").text(),
        PERMISSIONS_OWNER:$(".text-permissions-owner").text(),
        PERMISSIONS_OTHERS:$(".text-permissions-others").text(),
        PERMISSIONS_R:$(".text-permissions-r").text(),
        PERMISSIONS_W:$(".text-permissions-w").text(),
        PERMISSIONS_X:$(".text-permissions-x").text(),
        PERMISSIONS_D:$(".text-permissions-d").text(),
        PERMISSIONS_Y:$(".text-permissions-yes").text(),
        PERMISSIONS_N:$(".text-permissions-no").text(),
        TERMINAL:$(".text-terminal").text(),
        TERMINAL_FULL:$(".text-terminal-full").text(),
        SESSIONS:$(".text-sessions").text(),
        LOGGED_AS:$(".text-sessions-logged-as").text(),
        SESSIONS_USER:$(".text-sessions-user").text(),
        SESSIONS_PASSWORD:$(".text-sessions-password").text(),
        SESSIONS_REMOVE:$(".text-sessions-remove").text(),
        SESSIONS_CREATE:$(".text-sessions-create").text(),
        SESSIONS_LOGIN:$(".text-sessions-login").text(),
        MOVE_TO:$(".text-move-to").text(),
        VALIDATE:$(".text-validate").text(),
        INVALID_PATH:$(".text-move-to-invalid-path").text(),
        IMAGE_MANAGER:$(".text-image-manager").text(),
        CONFIG:$(".text-config").text(),
        CONFIG_Y:$(".text-config-yes").text(),
        CONFIG_N:$(".text-config-no").text(),
        CONFIG_SIGNATURE:$(".text-config-signature").text(),
        CONFIG_CRYPTED:$(".text-config-crypted").text(),
        CONFIG_SIZE:$(".text-config-size").text(),
        CONFIG_USED:$(".text-config-used").text(),
        CONFIG_FREE:$(".text-config-free").text(),
        CONFIG_WIDTH:$(".text-config-width").text(),
        CONFIG_HEIGHT:$(".text-config-height").text(),
        CONFIG_TABLE_SIZE:$(".text-config-table-size").text(),
        CONFIG_TABLE_EXTENDED:$(".text-config-extended").text(),
        CONFIG_ENTRY_NAME:$(".text-config-entry-name").text(),
        CONFIG_BLOCK_SIZE:$(".text-config-block-size").text(),
        CONFIG_BLOCK_NUMBER:$(".text-config-block-number").text(),
        ENCRYPTION:$(".text-encryption").text(),
        ENCRYPTION_TOOL:$(".text-encryption-tool").text(),
        ENCRYPTION_KEY:$(".text-encryption-key").text(),
        ENCRYPTION_ENCRYPT:$(".text-encryption-encrypt").text(),
        ENCRYPTION_DECRYPT:$(".text-encryption-decrypt").text(),
        ENCRYPTION_MISSING_KEY:$(".text-encryption-missing-key").text(),
        ENCRYPTION_SUCCESS:$(".text-encryption-success").text(),
        DECRYPTION_SUCCESS:$(".text-decryption-success").text(),
        SESSIONS_create_DONE:$(".text-sessions-create-done").text(),
        SESSIONS_remove_DONE:$(".text-sessions-remove-done").text(),
        SESSIONS_login_DONE:$(".text-sessions-login-done").text(),
        IMAGE_MANAGER_STEGANO:$(".text-image-manager-stegano").text(),
        EXPLORER:$(".text-explorer").text(),
        STEGANOGRAPHY_TOOL:$(".text-steganography-tool").text(),
        OPEN_WITH:$(".text-open-with").text(),
        RENAME:$(".text-rename").text(),
        REMOVE:$(".text-remove").text(),
        OPEN_WITH_TEXT:$(".text-open-with-text").text(),
        OPEN_WITH_IMAGE:$(".text-open-with-image").text(),
        OPEN_WITH_AUDIO:$(".text-open-with-audio").text(),
        OPEN_WITH_CMD:$(".text-open-with-cmd").text(),
        STEGANOGRAPHY_INFO:$(".text-steganography-info").text(),
        SCRIPT:$(".text-script-msg").text(),
        SHOW_HIDDEN:$(".text-show-hidden").text(),
        CLIPPY:$(".text-clippy-msg").text()
    }

/**
 * Paths to icons.
 * @type {Object}
 * @memberof GUI
 */
    GUI.ICONS = {
        _DIR:"/src/file-system/gui/",
        SAVE:"/src/file-system/gui/save.png",
        IMG:"/src/file-system/gui/file-img.png",
        AUDIO:"/src/file-system/gui/file-audio.png",
        TEXT:"/src/file-system/gui/file-text.png",
        CONF:"/src/file-system/gui/file-conf.png",
        CMD:"/src/file-system/gui/file-cmd.png",
        ERROR:"/src/file-system/gui/error.png",
        FOLDER_EMPTY:"/src/file-system/gui/folder-empty.png",
        FOLDER_FILES:"/src/file-system/gui/folder-files.png"
    }
