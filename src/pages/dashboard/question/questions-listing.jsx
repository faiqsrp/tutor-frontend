import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import GlobalFilter from "../../table/react-tables/GlobalFilter";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";

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
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "What is React?",
      answer: "React is a JavaScript library for building UI.",
      createdAt: new Date(),
    },
    {
      id: 2,
      question: "What is useState?",
      answer: "useState is a React hook that lets you manage state.",
      createdAt: new Date(),
    },
  ]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const handleAction = (action, row) => {
    if (action === "edit") navigate(`/add-question/${row.id}`, { state: { mode: "edit" } });
    if (action === "view") navigate(`/add-question/${row.id}`, { state: { mode: "view" } });
    if (action === "delete") {
      setQuestions((prev) => prev.filter((q) => q.id !== row.id));
    }
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => <span>{row.row.index + 1 + (page - 1) * limit}</span>,
      },
      {
        Header: "Question",
        accessor: "question",
        Cell: (row) => (
          <span>
            {row.cell.value.length > 30
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
            {row.cell.value.length > 30
              ? row.cell.value.substring(0, 30) + "..."
              : row.cell.value}
          </span>
        ),
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
            <button className="action-btn" onClick={() => handleAction("view", row.original)}>
              <Icon icon="heroicons:eye" />
            </button>
            <button className="action-btn" onClick={() => handleAction("edit", row.original)}>
              <Icon icon="heroicons:pencil-square" />
            </button>
            <button className="action-btn" onClick={() => handleAction("delete", row.original)}>
              <Icon icon="heroicons:trash" />
            </button>
          </div>
        ),
      },
    ],
    [page, limit]
  );

  const data = useMemo(() => questions, [questions]);

  const tableInstance = useTable(
    { columns: COLUMNS, data },
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
          Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page: tablePage,
    prepareRow,
    state,
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter } = state;

  return (
    <div>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Questions</h4>
          <div className="flex items-center gap-4">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              text="+ Add Question"
              className="btn-primary"
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
              {tablePage.length > 0 ? (
                tablePage.map((row) => {
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
      </Card>
    </div>
  );
};

export default QuestionsListing;
