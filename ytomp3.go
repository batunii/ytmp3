package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
)

var Counter = 0
var isDownloaded = false

func getCurrentSavedName() string {
	return "NewMp3" + fmt.Sprintf("%d", Counter) + ".mp3"
}
func getNextSavedName() string {
	Counter = Counter + 1
	return "NewMp3" + fmt.Sprintf("%d", Counter) + ".mp3"
}

func deleteFile(fileName string) {
	err := os.Remove(fileName)
	if err != nil {
		fmt.Printf("Error in Deleting file : %v", err)
	}
}
func ytdlDownloader(ytUrl string, fileName string) {
	fmt.Printf("[Go Youtube] :: Started the process to download %v, in file %s\n", ytUrl, fileName)
	cmd := exec.Command("yt-dlp", "-x", "--audio-format", "mp3", "--output", fileName, ytUrl)
	_, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Error generated : %v\n", err)
	}
	fmt.Printf("The File has been generated with name : %s\n", fileName)
	isDownloaded = true
}

func getStatusHandler(write http.ResponseWriter, read *http.Request) {
	enableCors(&write)
	fileName := read.FormValue("fileName")
	_, err := os.Stat(fileName)
	fmt.Fprintf(write, "%v", err == nil)
}
func downloadProvideHandler(write http.ResponseWriter, read *http.Request) {
	enableCors(&write)
	filePath := read.FormValue("fileName")
	defer deleteFile(filePath)

	file, err := os.Open(filePath)
	if err != nil {
		http.Error(write, "File not found", 404)
		return
	}
	defer file.Close()
	fileName := filepath.Base(filePath)

	write.Header().Set("Content-Disposition", "attachment; filename="+fileName)
	write.Header().Set("Content-Type", "application/octet-stream")
	write.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
	http.ServeFile(write, read, filePath)
}

func downloadTrigggerHandler(write http.ResponseWriter, read *http.Request) {
	enableCors(&write)
	ytUrl := read.FormValue("ytUrl")
	newFileName := getNextSavedName()
	go ytdlDownloader(ytUrl, newFileName)
	isDownloaded = false
	fmt.Fprintf(write, "{fileName:%s,status:In Progress}", newFileName)
}

func homePageHandler(write http.ResponseWriter, req *http.Request) {
	enableCors(&write)
	fmt.Fprintf(write, "Health.OK")
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*") // Or restrict to "http://localhost:3000"
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func main() {

	http.HandleFunc("/healthCheck", homePageHandler)
	http.HandleFunc("/download", downloadTrigggerHandler)
	http.HandleFunc("/getStatus", getStatusHandler)
	http.HandleFunc("/getDownload", downloadProvideHandler)
	fmt.Println(fmt.Sprintf("Triggering local host : %d", 8080))
	err := http.ListenAndServe("0.0.0.0:8080", nil)
	if err != nil {
		fmt.Printf("Encountered an error : %v \n", err.Error())
	}
}
