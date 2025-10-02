import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../../table/react-tables/GlobalFilter";

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

const StudentListing = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  // Pagination states from API
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);

  // Handle actions 
  const handleAction = (action, row) => {
    if (action === "edit") {
      navigate(`/student-form/${row._id}`, { state: { mode: "edit" } });
    }
    if (action === "view") {
      navigate(`/student-form/${row._id}`, { state: { mode: "view" } });
    }
    if (action === "delete") {
      //  open a delete confirmation modal here
      // navigate(`/students/${row._id}/delete`);
    }
  };

  const actions = [
    { name: "view", icon: "heroicons-outline:eye" },
    { name: "edit", icon: "heroicons:pencil-square" },
    { name: "delete", icon: "heroicons-outline:trash" },
  ];

  // Fetch Students API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/user/students?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        setStudents(response.data.data.students || []);

        //pagination from API response
        const pagination = response.data.data.pagination;
        setTotal(pagination.total);
        setPage(pagination.page);
        setLimit(pagination.limit);
        setPages(pagination.pages);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [page, limit]);

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => (
          <span>{row.row.index + 1 + (page - 1) * limit}</span>
        ),
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">
            {row?.cell?.value}
          </span>
        ),
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value}
          </span>
        ),
      },
      {
        Header: "Status",
        accessor: "isActive",
        Cell: (row) => (
          <span className="block w-full">
            <span
              className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-full bg-opacity-25 ${row?.cell?.value
                  ? "text-success-500 bg-success-500"
                  : "text-danger-500 bg-danger-500"
                }`}
            >
              {row?.cell?.value ? "Active" : "Inactive"}
            </span>
          </span>
        ),
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) => (
          <span>{new Date(row?.cell?.value).toLocaleDateString("en-GB")}</span>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <Dropdown
            classMenuItems="right-0 w-[140px] top-[110%]"
            label={
              <span className="text-xl text-center block w-full">
                <Icon icon="heroicons-outline:dots-vertical" />
              </span>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {actions.map((item, i) => (
                <Menu.Item key={i}>
                  <div
                    onClick={() => handleAction(item.name, row.original)}
                    className={`${item.name === "delete"
                        ? "bg-danger-500 text-danger-500 bg-opacity-30 hover:bg-opacity-100 hover:text-white"
                        : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50"
                      } w-full px-4 py-2 text-sm cursor-pointer flex space-x-2 items-center`}
                  >
                    <span className="text-base">
                      <Icon icon={item.icon} />
                    </span>
                    <span className="capitalize">{item.name}</span>
                  </div>
                </Menu.Item>
              ))}
            </div>
          </Dropdown>
        ),
      },
    ],
    [page, limit]
  );

  const data = useMemo(() => students, [students]);

  // react-table instance
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
    page: tablePage,
    prepareRow,
    state,
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter } = state;

  return (
    <Card noborder>
      <div className="md:flex justify-between items-center mb-6">
        <h4 className="card-title">Students</h4>
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
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
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody
                className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                {...getTableBodyProps()}
              >
                {tablePage.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="table-td">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/*Pagination */}
      <div className="md:flex justify-between items-center mt-6">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Page {page} of {pages} | Total {total} students
        </span>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};

export default StudentListing;
