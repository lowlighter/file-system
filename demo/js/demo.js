$(function () {
    //Shortcuts
        let GUI = Lowlight.FileSystem.GUI, Image = Lowlight.FileSystem.Image
    //Demo
        $("<img>").attr("src", "./imgs/image.png").on("load", function () {
            $(".app-view canvas").get(0).getContext("2d").drawImage($(this).get(0), 0, 0)
            new GUI(
                Image.open($(".app-view canvas").get(0).getContext("2d")),
                $(".app-controller").get(0)
            )
        })
})
