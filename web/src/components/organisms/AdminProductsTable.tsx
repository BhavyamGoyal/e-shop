"use client";

import Link from "next/link";
import { useProductsTable } from "@/lib/use-products-table";
import type { ProductListRow } from "@/server/types/admin.types";
import { Button } from "@/components/atoms/Button";
import { TagPicker } from "@/components/organisms/TagPicker";
import { Table } from "@/components/organisms/Table/Table";
import type { ColumnConfig } from "@/components/organisms/Table/Table.types";

const LINK_CLASS = "text-sm font-medium text-primary hover:underline";

export function AdminProductsTable() {
  const table = useProductsTable();

  const columns: ColumnConfig<ProductListRow>[] = [
    {
      key: "image",
      header: "image",
      width: 140,
      filterValue: (row) => row.image ?? "",
      render: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt=""
            loading="lazy"
            className="h-28 w-28 rounded-md object-cover"
          />
        ) : (
          <div className="h-28 w-28 rounded-md bg-muted" />
        ),
    },
    {
      key: "title",
      header: "title",
      sortable: true,
      filterable: true,
      width: 320,
      filterValue: (row) => row.title,
      render: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {row.handle}
          </div>
        </div>
      ),
    },
    {
      key: "productType",
      header: "type",
      sortable: true,
      filterable: true,
      filterValue: (row) => row.productType ?? "",
      render: (row) => row.productType || "-",
    },
    {
      key: "tags",
      header: "tags",
      width: 260,
      render: (row) => (
        <TagPicker
          compact
          options={table.tagOptions}
          selected={row.tags}
          onChange={(tags: string[]) => void table.setTags(row, tags)}
        />
      ),
    },
    {
      key: "price",
      header: "price",
      sortable: true,
      align: "right",
      render: (row) => `₹${row.price}`,
    },
    {
      key: "available",
      header: "status",
      sortable: true,
      filterValue: (row) => (row.available ? "Available" : "Hidden"),
      render: (row) => (row.available ? "Available" : "Hidden"),
    },
    {
      key: "active",
      header: "active",
      sortable: true,
      filterValue: (row) => (row.active ? "Active" : "Inactive"),
      render: (row) => (
        <Button
          variant="outline"
          tone={row.active ? "secondary" : "danger"}
          size="sm"
          onClick={() => void table.setActive(row, !row.active)}
        >
          {row.active ? "Active" : "Inactive"}
        </Button>
      ),
    },
    {
      key: "actions",
      header: "",
      sticky: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/product/${row.handle}`}
            target="_blank"
            className={LINK_CLASS}
          >
            View
          </Link>
          <Link href={`/admin/products/${row.id}`} className={LINK_CLASS}>
            Edit
          </Link>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      rows={table.rows}
      rowKey="id"
      sort={table.sort}
      onSortChange={table.setSort}
      pagination={table.pagination}
      onPageChange={table.setPage}
      onPageSizeChange={table.setPageSize}
      loading={table.isLoading}
      error={table.error}
      loadingMessage="Loading products…"
      emptyMessage="No products found."
      toolbar={
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-1.5">
          <h2 className="text-sm font-semibold text-foreground">Products</h2>
          <Link href="/admin/products/new">
            <Button size="sm">Add product</Button>
          </Link>
        </div>
      }
      showFilters
      filters={table.filters}
      onFilterChange={table.setFilter}
      filterPlaceholder="Search"
      urlKey="products"
    />
  );
}
