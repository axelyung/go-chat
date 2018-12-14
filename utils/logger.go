package chat_utils

import (
	"os"

	"github.com/rs/zerolog"
)

var Log = Logger{}

type Logger struct {
	internal zerolog.Logger
}

func init() {
	output := zerolog.ConsoleWriter{Out: os.Stdout}

	Log.internal = zerolog.New(output).With().Timestamp().Logger()

	Log.Info("Logger setup")
}

func (logger *Logger) Info(msg string) {
	logger.internal.Info().Msg(msg)
}

func (logger *Logger) Infof(format string, v ...interface{}) {
	logger.internal.Info().Msgf(format, v...)
}

func (logger *Logger) Error(msg string) {
	logger.internal.Error().Msg(msg)
}

func (logger *Logger) Errorf(format string, v ...interface{}) {
	logger.internal.Error().Msgf(format, v...)
}
