import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import GlobalFilter from "../../table/react-tables/GlobalFilter";
import axios from "axios";
import { toast } from "react-toastify";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import Icons from "@/components/ui/Icon";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;
    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);
    return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
  }
);

const QuestionsListing = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  // Fetch questions with pagination
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/questions/all`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
        params: {
          page: pageIndex + 1, 
          limit: pageSize,
        },
      });

      setQuestions(res.data.data || []);
      setPageCount(res.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [pageIndex, pageSize]);

  const handleAction = async (action, row) => {
    if (action === "view")
      navigate(`/add-question/${row._id}`, { state: { mode: "view" } });

    if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this question?")) {
        try {
          await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/delete/${row._id}`, {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          });
          toast.success("Question deleted successfully!");
          fetchQuestions();
        } catch {
          toast.error("Failed to delete question");
        }
      }
    }
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => <span>{row.row.index + 1 + pageIndex * pageSize}</span>,
      },
      {
        Header: "Question",
        accessor: "question",
        Cell: (row) => (
          <span>
            {row.cell.value?.length > 30
              ? row.cell.value.substring(0, 30) + "..."
              : row.cell.value}
          </span>
        ),
      },
      {
        Header: "Answer",
        accessor: "answer",
        Cell: (row) => (
          <span>
            {row.cell.value?.length > 30
              ? row.cell.value.substring(0, 30) + "..."
              : row.cell.value}
          </span>
        ),
      },
      {
        Header: "Paper Type",
        accessor: "paperType",
        Cell: (row) => <span>{row.cell.value || "N/A"}</span>,
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) => (
          <span>{new Date(row.cell.value).toLocaleDateString("en-GB")}</span>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="flex space-x-3">
            <button
              className="action-btn"
              onClick={() => handleAction("view", row.original)}
            >
              <Icon icon="heroicons:eye" />
            </button>
            <button
              className="action-btn"
              onClick={() => handleAction("delete", row.original)}
            >
              <Icon icon="heroicons:trash" className="text-red-600" />
            </button>
          </div>
        ),
      },
    ],
    [pageIndex, pageSize]
  );

  const data = useMemo(() => questions, [questions]);

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data,
      manualPagination: true,
      pageCount,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    state,
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter, pageIndex: currentPageIndex } = state;

  return (
    <div>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Questions</h4>
          <div className="flex items-center gap-4">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              text="+ Add Question"
              className="btn-primary h-10"
              onClick={() => navigate("/add-question/add")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <table
            className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
            {...getTableProps()}
          >
            <thead className="border-t border-slate-100 dark:border-slate-800">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="table-th"
                    >
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody {...getTableBodyProps()} className="text-left">
              {loading ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="py-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : page.length > 0 ? (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="table-td border-b">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="py-6 text-gray-500">
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="md:flex justify-between items-center mt-6">
          <div className="flex items-center space-x-3">
            <span>
              Page {pageIndex + 1} of {pageCount}
            </span>
          </div>

          <ul className="flex items-center space-x-3">
            <li>
              <button
                className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                <Icons icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li>
              <button
                className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                Prev
              </button>
            </li>

            {pageOptions.map((page, idx) => (
              <li key={idx}>
                <button
                  onClick={() => gotoPage(idx)}
                  className={`${
                    idx === pageIndex
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900"
                  } px-2 py-1 rounded`}
                >
                  {page + 1}
                </button>
              </li>
            ))}

            <li>
              <button
                className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          <div className="flex items-center space-x-3">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="form-select py-2"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuestionsListing;
