from app.schemas.employee import PaginatedResponse


class TestPaginatedResponse:
    def test_build_basic(self) -> None:
        items = [1, 2, 3]
        response = PaginatedResponse.build(items=items, total=15, page=1, size=5)

        assert response.items == items
        assert response.total == 15
        assert response.page == 1
        assert response.size == 5
        assert response.total_pages == 3

    def test_build_exact_page_boundary(self) -> None:
        items: list[int] = []
        response = PaginatedResponse.build(items=items, total=10, page=1, size=5)
        assert response.total_pages == 2

    def test_build_partial_last_page(self) -> None:
        items: list[int] = []
        response = PaginatedResponse.build(items=items, total=11, page=1, size=5)
        assert response.total_pages == 3

    def test_build_zero_total(self) -> None:
        items: list[int] = []
        response = PaginatedResponse.build(items=items, total=0, page=1, size=5)
        assert response.total_pages == 0

    def test_build_zero_size(self) -> None:
        items: list[int] = []
        response = PaginatedResponse.build(items=items, total=10, page=1, size=0)
        assert response.total_pages == 0
