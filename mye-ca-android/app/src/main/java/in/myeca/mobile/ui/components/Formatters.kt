package `in`.myeca.mobile.ui.components

fun formatIndianCurrency(value: Int): String {
    val raw = value.toString()
    if (raw.length <= 3) return "Rs $raw"

    val lastThree = raw.takeLast(3)
    val leading = raw.dropLast(3)
    val groupedLeading = leading.reversed()
        .chunked(2)
        .joinToString(",")
        .reversed()

    return "Rs $groupedLeading,$lastThree"
}
