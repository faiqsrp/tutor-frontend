import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@/components/ui/Card";
// import Icon from "@/components/ui/Icon";
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

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        {...rest}
        className="table-checkbox"
      />
    );
  }
);

const AllStudentListing = () => {
  // const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState("");

  // Pagination states
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);

  // // Handle actions
  // const handleAction = (action, row) => {
  //   if (action === "edit") {
  //     navigate(`/student-form/${row._id}`, { state: { mode: "edit" } });
  //   }
  //   if (action === "view") {
  //     navigate(`/student-form/${row._id}`, { state: { mode: "view" } });
  //   }
  //   if (action === "delete") {
  //     // open delete modal
  //   }
  // };

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/user/Get-all`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        setTutors(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      }
    };
    fetchTutors();
  }, []);

  // Fetch Students (all or filtered)
 const fetchStudents = async (tenantId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/user/getStudentByAdmin`,
      {
        headers: { Authorization: `${token}` },
        params: { tenantId },
      }
    );

    console.log("Students API response =>", res.data);

    // Extract students + pagination
    const { students, pagination } = res.data?.data || {};
    setStudents(students || []);

    if (pagination) {
      setTotal(pagination.total || 0);
      setPage(pagination.page || 1);
      setLimit(pagination.limit || 10);
      setPages(pagination.pages || 1);
    }
  } catch (err) {
    console.error("Error fetching students:", err);
  }
};


  const handleTutorChange = (e) => {
    const tenantId = e.target.value;
    setSelectedTutor(tenantId);
    localStorage.setItem("selectedTutor", tenantId);
    if (tenantId) {
      fetchStudents(tenantId); // call with correct id
    }
  };
  useEffect(() => {
  const savedTutor = localStorage.getItem("selectedTutor");
  if (savedTutor) {
    setSelectedTutor(savedTutor);
    fetchStudents(savedTutor);
  }
}, []);


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
      // {
      //   Header: "Action",
      //   accessor: "action",
      //   Cell: ({ row }) => (
      //     <div className="flex space-x-3 rtl:space-x-reverse">
      //       <button
      //         className="action-btn"
      //         type="button"
      //         onClick={() => handleAction("view", row.original)}
      //       >
      //         <Icon icon="heroicons:eye" />
      //       </button>
      //       <button
      //         className="action-btn"
      //         type="button"
      //         onClick={() => handleAction("edit", row.original)}
      //       >
      //         <Icon icon="heroicons:pencil-square" />
      //       </button>
      //       <button
      //         className="action-btn"
      //         type="button"
      //         onClick={() => handleAction("delete", row.original)}
      //       >
      //         <Icon icon="heroicons:trash" />
      //       </button>
      //     </div>
      //   ),
      // },
    ],
    [page, limit]
  );

  const data = useMemo(() => students, [students]);

  const tableInstance = useTable(
    { columns: COLUMNS, data },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
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

        {/* Tutor Filter */}
        <div className="flex gap-4 items-center">
          <select
            value={selectedTutor}
            onChange={handleTutorChange}
            className="border p-2 rounded"
          >
            <option value="">Select Tutor</option>
            {tutors.map((t) => (
              <option key={t._id} value={t.tenantId}>
                {t.name}
              </option>
            ))}
          </select>


          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table
              className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
              {...getTableProps()}
            >
              <thead>
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
              <tbody {...getTableBodyProps()}>
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

      {/* Pagination */}
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

export default AllStudentListing;
