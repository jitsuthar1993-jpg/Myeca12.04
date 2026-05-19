package com.myeca.smarttax.ui.app

data class MyeCaServiceCatalogItem(
    val id: String,
    val title: String,
    val category: String,
    val description: String,
    val price: String,
    val path: String
)

val myeCaServices = listOf(
    MyeCaServiceCatalogItem(
        id = "itr-filing",
        title = "ITR Filing",
        category = "Income Tax",
        description = "CA-reviewed income tax return filing with document checks.",
        price = "From Rs 999 excluding GST",
        path = "/itr/form-selector"
    ),
    MyeCaServiceCatalogItem(
        id = "gst-registration",
        title = "GST Registration",
        category = "GST",
        description = "Registration support, document review, and activation guidance.",
        price = "From Rs 2,999",
        path = "/services/gst-registration"
    ),
    MyeCaServiceCatalogItem(
        id = "company-registration",
        title = "Company Setup",
        category = "Startup",
        description = "Private Limited, LLP, and OPC setup workflows.",
        price = "From Rs 7,999",
        path = "/startup/company-registration"
    ),
    MyeCaServiceCatalogItem(
        id = "tax-notice-help",
        title = "Notice Help",
        category = "Tax Notice",
        description = "Response planning and expert review for tax notices.",
        price = "From Rs 2,999",
        path = "/services/income-tax-notice"
    )
)
