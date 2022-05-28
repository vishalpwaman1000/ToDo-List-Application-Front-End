import React, { useEffect, useState } from 'react'
import './HomePage.scss'
import ToDoListServices from '../services/ToDoListServices'
import TextField from '@material-ui/core/TextField'
import Pagination from '@material-ui/lab/Pagination'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { GetNote } from '../configuration/Configuration'

const toDoListServices = new ToDoListServices()
//
export default function HomePage() {
  const [Notes, setNotes] = useState('')
  const [NoteID, setNoteID] = useState('')
  const [NotesFlag, setNotesFlag] = useState(false)
  const [EditFlag, setEditFlag] = useState(false)
  const [Sortvalue, setSortValue] = React.useState('Desc')
  const [ScheduleDate, setScheduleDate] = useState(Date().toLocaleString()) //
  const [openSnackBar, setOpenSnackBar] = React.useState(false)
  const [SnackMessage, setSnackMessage] = useState('')
  const [PageNumber, setPageNumber] = useState(1)
  const [NumberOfRecordPerPage, setNumberOfRecordPerPage] = useState(4)
  const [TotalPages, setTotalPages] = useState(0)
  const [NoteData, setNoteData] = useState([])

  useEffect(() => {
    console.log('Use Effect Calling ... ')
    GetNotes(PageNumber, Sortvalue)
  }, [])

  const GetNotes = (PageNumber, Sort) => {
    let data = {
      pageNumber: PageNumber,
      numberOfRecordPerPage: NumberOfRecordPerPage,
      sortBy: Sort,
    }
    toDoListServices
      .GetNote(data)
      .then((data) => {
        // debugger
        if (data.data.data === null && PageNumber - 1 > 0) {
          GetNotes(PageNumber - 1, Sort)
        }
        console.log('Data : ', data)
        setNoteData(data.data.data)
        // setSnackMessage(data.data.message)
        setTotalPages(data.data.totalPages)
        setPageNumber(data.data.currentPage)
        // setOpenSnackBar(true)
      })
      .catch((error) => {
        console.log('Error : ', error)
        setSnackMessage('Something Went Wrong')
        setOpenSnackBar(true)
      })
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpenSnackBar(false)
  }

  const handleDateChange = (date) => {
    setScheduleDate(date)
  }

  const handleSortChange = async (event) => {
    console.log('Sort : ', event.target.value)
    await setSortValue(event.target.value)
    await GetNotes(PageNumber, event.target.value)
  }

  const handleChange = (e) => {
    console.log('Value : ', e.target.value)
    setNotes(e.target.value)
  }

  const handlePaging = (event, value) => {
    console.log('Page Number : ', value)
    setPageNumber(value)
    GetNotes(value, Sortvalue)
  }

  const handleDone = () => {
    setNotesFlag(false)
    if (Notes === '') {
      setSnackMessage('Dude Please, Enter Your Note')
      setOpenSnackBar(true)
      setNotesFlag(true)
      return
    }
    // var formattedDate = format(ScheduleDate, 'dd-MMMM-yyyy H:mma')

    if (EditFlag === false) {
      const data = {
        note: Notes,
        scheduleDateTime: ScheduleDate,
      }

      toDoListServices
        .InsertNote(data)
        .then((data) => {
          console.log('Data : ', data)
          setSnackMessage(data.data.message)
          setOpenSnackBar(true)
          GetNotes(PageNumber, Sortvalue)
          setNotes('')
          setScheduleDate(Date().toLocaleString())
        })
        .catch((error) => {
          console.log('Error : ', error)
          setSnackMessage('Something Went Wrong')
          setOpenSnackBar(true)
          GetNotes(PageNumber, Sortvalue)
        })
    } else {
      const data = {
        id: NoteID,
        note: Notes,
        scheduleDateTime: ScheduleDate,
      }

      toDoListServices
        .UpdateNote(data)
        .then((data) => {
          console.log('Data : ', data)
          setSnackMessage(data.data.message)
          setOpenSnackBar(true)
          GetNotes(PageNumber, Sortvalue)
          setNotes('')
          setScheduleDate(Date().toLocaleString())
        })
        .catch((error) => {
          console.log('Error : ', error)
          setSnackMessage('Something Went Wrong')
          setOpenSnackBar(true)
          GetNotes(PageNumber, Sortvalue)
        })
    }
    console.log(data)
  }

  const handleEditNote = (id) => {
    console.log('handle Edit Note id : ', id)
    toDoListServices
      .GetNoteById(id)
      .then((data) => {
        console.log('Data : ', data)
        setNoteID(id)
        setNotes(data.data.data.note)
        setEditFlag(true)
        setScheduleDate(data.data.data.scheduleDateTime)
        setSnackMessage(data.data.message)
        setOpenSnackBar(true)
      })
      .catch((error) => {
        console.log('Error : ', error)
        setSnackMessage('Something Went Wrong')
        setOpenSnackBar(true)
      })
  }

  const handleDeleteNote = (id) => {
    console.log('handle Delete Note id : ', id)
    toDoListServices
      .DeleteNote(id)
      .then((data) => {
        debugger
        console.log('Data : ', data)
        setSnackMessage(data.data.message)
        setOpenSnackBar(true)
        GetNotes(PageNumber, Sortvalue)
      })
      .catch((error) => {
        console.log('Error : ', error)
        setSnackMessage('Something Went Wrong')
        setOpenSnackBar(true)
      })
  }

  return (
    <div className="Container">
      <div className="Sub-Container">
        <div className="Body1">
          <TextField
            className="Note"
            error={NotesFlag}
            autoComplete="Off"
            size="small"
            fullWidth
            label="Notes"
            variant="outlined"
            value={Notes}
            onChange={handleChange}
          />
          <div className="Date">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                className="Schedule-Date"
                disableToolbar
                // variant="inline"
                format="dd/MM/yyyy"
                margin="normal"
                label="Schedule Date"
                value={ScheduleDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
              <KeyboardTimePicker
                className="Schedule-Time"
                margin="normal"
                // variant="inline"
                label="Schedule Time"
                value={ScheduleDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className="Done">
            <RadioGroup
              className="RadioGroup"
              value={Sortvalue}
              onChange={handleSortChange}
            >
              <FormControlLabel value="Asc" control={<Radio />} label="Asc" />
              <FormControlLabel value="Desc" control={<Radio />} label="Desc" />
            </RadioGroup>
            <div className="Button">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDone()}
              >
                <ThumbUpIcon />
                &nbsp; Done
              </Button>
            </div>
          </div>
        </div>
        <div className="Body2">
          <div className="Data-flex" style={{ margin: '5px 0 0 0', color: 'blue' }}>
            <div className="NoteID" style={{ flex: 1.5 }}>
              Note ID
            </div>
            <div className="Notes" style={{ flex: 6 }}>
              Notes
            </div>
            <div className="Schedule-DateTime" style={{ flex: 3 }}>
              Schedule Date
            </div>
            <div className="Schedule-DateTime" style={{ flex: 3 }}>
              Schedule Time
            </div>
            <div className="Operation" style={{ flex: 3 }}>
              Setting
            </div>
          </div>
          {Array.isArray(NoteData) &&
            NoteData.map(function (data, index) {
              return (
                <div className="Data-flex" key={index}>
                  <div className="NoteID" style={{ flex: 1.5 }}>
                    {data.noteId}
                  </div>
                  <div
                    className="Notes"
                    style={{
                      flex: 6,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {data.note}
                  </div>
                  <div className="Schedule-DateTime" style={{ flex: 3 }}>
                    {data.scheduleDate}
                  </div>
                  <div className="Schedule-DateTime" style={{ flex: 3 }}>
                    {data.scheduleTime}
                  </div>
                  <div className="Operation" style={{ flex: 3 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      style={{ margin: '0 5px 0 0' }}
                      onClick={() => {
                        handleEditNote(data.id)
                      }}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        handleDeleteNote(data.id)
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      <div className="Pagination">
        <Pagination
          count={TotalPages}
          page={PageNumber}
          onChange={handlePaging}
          variant="outlined"
          shape="rounded"
        />
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleClose}
        message={SnackMessage}
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={handleClose}>
              UNDO
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  )
}
