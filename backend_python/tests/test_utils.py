"""Unit test untuk backend_python/utils.py (tanpa API key)."""

import pytest

from backend_python.utils import locale_instruction, parse_json_response


class TestParseJsonResponse:
    def test_plain_json_array(self):
        assert parse_json_response('[{"a": 1}]') == [{"a": 1}]

    def test_plain_json_object(self):
        assert parse_json_response('{"a": 1}') == {"a": 1}

    def test_json_in_code_fence(self):
        text = '```json\n[{"flag_id": "RF_001", "is_valid": true}]\n```'
        assert parse_json_response(text) == [{"flag_id": "RF_001", "is_valid": True}]

    def test_json_in_bare_fence(self):
        text = '```\n{"x": "y"}\n```'
        assert parse_json_response(text) == {"x": "y"}

    def test_json_with_prose_around_it(self):
        text = 'Berikut hasilnya:\n[{"a": 1}, {"a": 2}]\nSemoga membantu.'
        assert parse_json_response(text) == [{"a": 1}, {"a": 2}]

    def test_empty_raises(self):
        with pytest.raises(ValueError):
            parse_json_response("")
        with pytest.raises(ValueError):
            parse_json_response(None)

    def test_garbage_raises(self):
        with pytest.raises(ValueError):
            parse_json_response("tidak ada json di sini")


class TestLocaleInstruction:
    def test_id_default(self):
        assert "BAHASA INDONESIA" in locale_instruction("id")

    def test_en(self):
        assert "ENGLISH" in locale_instruction("en")

    def test_unknown_falls_back_to_id(self):
        assert "BAHASA INDONESIA" in locale_instruction("fr")
