from app.schemas.employee import PaginatedResponse


class TestPaginatedResponse:
    def test_build_basic(self) -> None:
        items = [1, 2, 3]
        response = PaginatedResponse.build(items=items, total=15, offset=0, limit=5)

        assert response.items == items
        assert response.total == 15
        assert response.offset == 0
        assert response.limit == 5
