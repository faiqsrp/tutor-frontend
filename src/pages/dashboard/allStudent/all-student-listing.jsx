import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../../table/react-tables/GlobalFilter";
import Loader from "@/assets/images/logo/logo.png";
import Select from "@/components/ui/Select";

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
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/user/Get-all`,
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
 // ✅ Updated fetchStudents — backend pagination added
const fetchStudents = async (tenantId = selectedTutor?.value) => {
  if (!tenantId) return;
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/user/getStudentByAdmin`,
      {
        headers: { Authorization: `${token}` },
        params: { tenantId, page, limit }, // ✅ Added page & limit
      }
    );

    console.log("Students API response =>", res.data);

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
  } finally {
    setLoading(false);
  }
};

//  New effect — refetch when page or limit changes
useEffect(() => {
  const tenantId = selectedTutor?.value || localStorage.getItem("selectedTutor");
  if (tenantId) {
    fetchStudents(tenantId);
  }
}, [page, limit]); 


  // Handle tutor selection (React Select)
  const handleTutorChange = (selectedOption) => {
    if (!selectedOption) return;
    const tenantId = selectedOption.value;
    setSelectedTutor(selectedOption);
    localStorage.setItem("selectedTutor", tenantId);
    fetchStudents(tenantId);
  };

  // Load saved tutor on page refresh
  useEffect(() => {
    const savedTutor = localStorage.getItem("selectedTutor");
    if (savedTutor) {
      const tutorObj = tutors
        .filter((t) => t.name && (t.tenantId?._id || t.tenantId))
        .map((t) => ({
          value: t.tenantId?._id || t.tenantId,
          label: t.name,
        }))
        .find((opt) => opt.value === savedTutor);

      if (tutorObj) {
        setSelectedTutor(tutorObj);
        fetchStudents(savedTutor);
      }
    }
  }, [tutors]);

  // Tutor dropdown options
  const options = useMemo(
    () =>
      tutors
        .filter((t) => t.name && (t.tenantId?._id || t.tenantId))
        .map((t) => ({
          value: t.tenantId?._id || t.tenantId,
          label: t.name,
        })),
    [tutors]
  );

  // Columns for table
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
                  ? "text-white bg-primary-700"
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
    ],
    [page, limit]
  );

  const data = useMemo(() => students, [students]);

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

        {/* Tutor Filter */}
        <div className="flex gap-4 items-center">
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
          <div className="min-w-[220px]">
            <Select
              options={options}
              placeholder="Select Tutor"
              value={selectedTutor}
              onChange={handleTutorChange}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: "40px",
                  borderRadius: "8px",
                  padding: "0 4px",
                  fontSize: "14px",
                  borderColor: state.isFocused ? "primary-900" : "#3B82F6", // primary-900 : primary-500
                  boxShadow: state.isFocused ? "0 0 0 1px #1E40AF" : "none",
                  "&:hover": {
                    borderColor: "#1E40AF", // hover effect
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 100,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "#3B82F6" // primary-500 on hover
                    : state.isSelected
                      ? "#1E40AF" // primary-900 when selected
                      : "white",
                  color: state.isFocused || state.isSelected ? "white" : "black",
                  fontSize: "14px",
                  cursor: "pointer",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#6B7280", // gray-500
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "#111827", // gray-900
                }),
              }}
            />

          </div>
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
              <tbody {...getTableBodyProps()} className="text-left">
                {loading ? (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="py-10">
                      <div className="flex justify-center items-center">
                        <img
                          src={Loader}
                          alt="Loading..."
                          className="w-100 h-32"
                        />
                      </div>
                    </td>
                  </tr>
                ) : tablePage.length > 0 ? (
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
                    <td
                      colSpan={COLUMNS.length + 1}
                      className="py-6 text-gray-500 text-center"
                    >
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-700 dark:text-slate-300">
            Go to page:
          </span>
          <input
            type="number"
            min="1"
            max={pages}
            value={page}
            onChange={(e) => {
              const newPage = Number(e.target.value);
              if (newPage >= 1 && newPage <= pages) setPage(newPage);
            }}
            className="w-16 border rounded-md px-2 py-1 text-center dark:bg-slate-800 dark:text-white"
          />
          <span className="text-slate-700 dark:text-slate-300">
            Page <strong>{page}</strong> of {pages}
          </span>
          <span className="text-slate-700 dark:text-slate-300">
            | Total {total} students
          </span>
        </div>

        {/* Middle Section - Numeric Pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 bg-slate-100 rounded-md disabled:opacity-50"
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-slate-100 rounded-md disabled:opacity-50"
          >
            ‹
          </button>

          {Array.from({ length: pages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 rounded-md border transition-colors ${
                page === num
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1 bg-slate-100 rounded-md disabled:opacity-50"
          >
            ›
          </button>
          <button
            onClick={() => setPage(pages)}
            disabled={page === pages}
            className="px-3 py-1 bg-slate-100 rounded-md disabled:opacity-50"
          >
            »
          </button>
        </div>

        {/* Right Section - Page Size */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-700 dark:text-slate-300">Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-2 py-1 dark:bg-slate-800 dark:text-white"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-slate-700 dark:text-slate-300">entries</span>
        </div>
      </div>
    </Card>
  );
};

export default AllStudentListing;
