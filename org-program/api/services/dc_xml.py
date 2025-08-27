from typing import Iterable

from lxml import etree


DC_NS = "http://purl.org/dc/elements/1.1/"


def _add_elems(parent, tag: str, values):
    for value in values:
        if value is None:
            continue
        text = str(value).strip()
        if not text:
            continue
        el = etree.SubElement(parent, f"{{{DC_NS}}}{tag}")
        el.text = text


def items_to_dc_xml(items: Iterable[dict]) -> str:
    root = etree.Element("records", nsmap={"dc": DC_NS})
    for item in items:
        record = etree.SubElement(root, "record")

        # Scalars
        _add_elems(record, "title", [item.get("title")])
        _add_elems(record, "description", [item.get("description")])
        _add_elems(record, "date", [item.get("date")])
        _add_elems(record, "type", [item.get("type")])
        _add_elems(record, "format", [item.get("format")])
        _add_elems(record, "coverage", [item.get("coverage")])
        _add_elems(record, "rights", [item.get("rights")])
        _add_elems(record, "publisher", [item.get("publisher")])
        _add_elems(record, "language", [item.get("language")])
        _add_elems(record, "source", [item.get("source")])

        # Arrays
        _add_elems(record, "creator", item.get("creators", []) or [])
        _add_elems(record, "contributor", item.get("contributors", []) or [])
        _add_elems(record, "subject", item.get("subjects", []) or [])
        _add_elems(record, "identifier", item.get("identifiers", []) or [])

    return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="UTF-8").decode("utf-8")
