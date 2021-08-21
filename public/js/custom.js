function yesnoCheck(that) {
    if (that.value == "img") {
        document.getElementById("input-img").style.display = "block";
        document.getElementById("input-url").style.display = "none";
    } else {
        document.getElementById("input-url").style.display = "block";
        document.getElementById("input-img").style.display = "none";
    }
}
